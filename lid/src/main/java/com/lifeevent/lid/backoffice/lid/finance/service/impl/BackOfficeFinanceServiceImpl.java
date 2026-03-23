package com.lifeevent.lid.backoffice.lid.finance.service.impl;

import com.lifeevent.lid.backoffice.lid.finance.dto.BackOfficeFinanceOverviewDto;
import com.lifeevent.lid.backoffice.lid.finance.dto.BackOfficeFinanceTransactionDto;
import com.lifeevent.lid.backoffice.lid.finance.service.BackOfficeFinanceService;
import com.lifeevent.lid.common.cache.CatalogCacheNames;
import com.lifeevent.lid.payment.entity.Payment;
import com.lifeevent.lid.payment.enums.PaymentStatus;
import com.lifeevent.lid.payment.repository.PaymentRepository;
import com.lifeevent.lid.payment.repository.RefundRepository;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeFinanceServiceImpl implements BackOfficeFinanceService {
    private static final long AGGREGATION_TIMEOUT_SECONDS = 8L;

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    @Resource(name = "aggregatorExecutor")
    private Executor aggregatorExecutor;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = CatalogCacheNames.BACKOFFICE_FINANCE_OVERVIEW,
            key = "#days == null ? 30 : #days",
            sync = true
    )
    public BackOfficeFinanceOverviewDto getOverview(Integer days) {
        int safeDays = normalizeDays(days);
        LocalDateTime from = LocalDateTime.now().minusDays(safeDays);

        CompletableFuture<BigDecimal> inflowsFuture = supplyAggregationAsync(
                () -> safeAmount(paymentRepository.sumAmountByStatusFrom(PaymentStatus.COMPLETED, from))
        );
        CompletableFuture<BigDecimal> outflowsFuture = supplyAggregationAsync(
                () -> safeAmount(refundRepository.sumAmountByStatusFrom("COMPLETED", from))
        );
        CompletableFuture<BigDecimal> pendingFuture = supplyAggregationAsync(
                () -> safeAmount(paymentRepository.sumAmountByStatusFrom(PaymentStatus.PENDING, from))
        );
        CompletableFuture<BigDecimal> totalSuccessFuture = supplyAggregationAsync(
                () -> safeAmount(paymentRepository.sumAmountByStatusFrom(PaymentStatus.COMPLETED, null))
        );
        CompletableFuture<BigDecimal> totalRefundsFuture = supplyAggregationAsync(
                () -> safeAmount(refundRepository.sumAmountByStatusFrom("COMPLETED", null))
        );

        CompletableFuture.allOf(
                inflowsFuture,
                outflowsFuture,
                pendingFuture,
                totalSuccessFuture,
                totalRefundsFuture
        ).join();

        BigDecimal inflows = inflowsFuture.join();
        BigDecimal outflows = outflowsFuture.join();
        BigDecimal pending = pendingFuture.join();
        BigDecimal totalSuccess = totalSuccessFuture.join();
        BigDecimal totalRefunds = totalRefundsFuture.join();
        BigDecimal available = totalSuccess.subtract(totalRefunds);

        return BackOfficeFinanceOverviewDto.builder()
                .availableBalance(available)
                .inflows(inflows)
                .outflows(outflows)
                .pending(pending)
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private <T> CompletableFuture<T> supplyAggregationAsync(Supplier<T> supplier) {
        return CompletableFuture.supplyAsync(supplier, aggregatorExecutor)
                .orTimeout(AGGREGATION_TIMEOUT_SECONDS, TimeUnit.SECONDS);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = CatalogCacheNames.BACKOFFICE_FINANCE_TRANSACTIONS,
            key = "#size == null ? 50 : #size",
            sync = true
    )
    public List<BackOfficeFinanceTransactionDto> getTransactions(Integer size) {
        int safeSize = normalizeSize(size);

        List<BackOfficeFinanceTransactionDto> transactions = new ArrayList<>();
        transactions.addAll(mapPaymentsToTransactions(safeSize));
        transactions.addAll(mapRefundsToTransactions(safeSize));

        transactions.sort(Comparator.comparing(BackOfficeFinanceTransactionDto::getDate,
                Comparator.nullsLast(LocalDateTime::compareTo)).reversed());

        if (transactions.size() > safeSize) {
            return transactions.subList(0, safeSize);
        }
        return transactions;
    }

    @Override
    @Transactional(readOnly = true)
    public String exportCsv(Integer days) {
        int safeDays = normalizeDays(days);
        LocalDateTime from = LocalDateTime.now().minusDays(safeDays);

        List<BackOfficeFinanceTransactionDto> transactions = getTransactions(200).stream()
                .filter(tx -> tx.getDate() == null || !tx.getDate().isBefore(from))
                .toList();

        StringBuilder csv = new StringBuilder();
        csv.append("id;type;method;amount;status;date\\n");
        for (BackOfficeFinanceTransactionDto tx : transactions) {
            csv.append(escape(tx.getId())).append(';')
                    .append(escape(tx.getType())).append(';')
                    .append(escape(tx.getMethod())).append(';')
                    .append(tx.getAmount() == null ? "0" : tx.getAmount().toPlainString()).append(';')
                    .append(escape(tx.getStatus())).append(';')
                    .append(tx.getDate() == null ? "" : tx.getDate().toString())
                    .append('\n');
        }
        return csv.toString();
    }

    private List<BackOfficeFinanceTransactionDto> mapPaymentsToTransactions(int size) {
        PageRequest pageRequest = PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "paymentDate", "createdAt", "id"));
        List<Payment> payments = paymentRepository.findAll(pageRequest).getContent();
        List<BackOfficeFinanceTransactionDto> rows = new ArrayList<>(payments.size());

        for (Payment payment : payments) {
            rows.add(BackOfficeFinanceTransactionDto.builder()
                    .id(payment.getTransactionId() != null ? payment.getTransactionId() : String.valueOf(payment.getId()))
                    .type("Paiement")
                    .method(payment.getOperator() == null ? "-" : payment.getOperator().name())
                    .amount(safeAmount(payment.getAmount()))
                    .status(mapPaymentStatus(payment.getStatus()))
                    .date(payment.getPaymentDate() != null ? payment.getPaymentDate() : payment.getCreatedAt())
                    .build());
        }
        return rows;
    }

    private List<BackOfficeFinanceTransactionDto> mapRefundsToTransactions(int size) {
        PageRequest pageRequest = PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "processedDate", "createdAt", "id"));
        List<RefundRepository.RefundTransactionView> refunds = refundRepository.findTransactionRows(pageRequest);
        List<BackOfficeFinanceTransactionDto> rows = new ArrayList<>(refunds.size());

        for (RefundRepository.RefundTransactionView refund : refunds) {
            rows.add(BackOfficeFinanceTransactionDto.builder()
                    .id(refund.getRefundId() != null ? refund.getRefundId() : String.valueOf(refund.getId()))
                    .type("Remboursement")
                    .method(refund.getOperator() == null ? "-" : refund.getOperator().name())
                    .amount(safeAmount(refund.getAmount()).negate())
                    .status(mapRefundStatus(refund.getStatus()))
                    .date(refund.getProcessedDate() != null ? refund.getProcessedDate() : refund.getCreatedAt())
                    .build());
        }
        return rows;
    }

    private int normalizeDays(Integer days) {
        if (days == null) {
            return 30;
        }
        return Math.max(1, Math.min(days, 365));
    }

    private int normalizeSize(Integer size) {
        if (size == null) {
            return 50;
        }
        return Math.max(1, size);
    }

    private BigDecimal safeAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }

    private String mapPaymentStatus(PaymentStatus status) {
        if (status == null) {
            return "-";
        }
        return switch (status) {
            case COMPLETED -> "Succes";
            case PENDING -> "En attente";
            case FAILED -> "Échec";
            case CANCELLED -> "Annulé";
            case REFUNDED -> "Remboursée";
        };
    }

    private String mapRefundStatus(String status) {
        if (status == null) {
            return "-";
        }
        return switch (status.trim().toUpperCase()) {
            case "COMPLETED" -> "Remboursée";
            case "PENDING" -> "En attente";
            case "FAILED" -> "Échec";
            case "PROCESSING" -> "Traitement";
            default -> status;
        };
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\n", " ").replace("\\r", " ").replace(';', ',').trim();
    }
}
