package com.lifeevent.lid.backoffice.lid.finance.service.impl;

import com.lifeevent.lid.backoffice.lid.finance.dto.BackOfficeFinanceOverviewDto;
import com.lifeevent.lid.backoffice.lid.finance.dto.BackOfficeFinanceTransactionDto;
import com.lifeevent.lid.backoffice.lid.finance.service.BackOfficeFinanceService;
import com.lifeevent.lid.payment.entity.Payment;
import com.lifeevent.lid.payment.entity.Refund;
import com.lifeevent.lid.payment.enums.PaymentStatus;
import com.lifeevent.lid.payment.repository.PaymentRepository;
import com.lifeevent.lid.payment.repository.RefundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeFinanceServiceImpl implements BackOfficeFinanceService {

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;

    @Override
    @Transactional(readOnly = true)
    public BackOfficeFinanceOverviewDto getOverview(Integer days) {
        int safeDays = normalizeDays(days);
        LocalDateTime from = LocalDateTime.now().minusDays(safeDays);

        BigDecimal inflows = sumPaymentAmounts(PaymentStatus.COMPLETED, from);
        BigDecimal outflows = sumRefundAmounts("COMPLETED", from);
        BigDecimal pending = sumPaymentAmounts(PaymentStatus.PENDING, from);

        BigDecimal totalSuccess = sumPaymentAmounts(PaymentStatus.COMPLETED, null);
        BigDecimal totalRefunds = sumRefundAmounts("COMPLETED", null);
        BigDecimal available = totalSuccess.subtract(totalRefunds);

        return BackOfficeFinanceOverviewDto.builder()
                .availableBalance(available)
                .inflows(inflows)
                .outflows(outflows)
                .pending(pending)
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
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
        List<Refund> refunds = refundRepository.findAll(pageRequest).getContent();
        List<BackOfficeFinanceTransactionDto> rows = new ArrayList<>(refunds.size());

        for (Refund refund : refunds) {
            rows.add(BackOfficeFinanceTransactionDto.builder()
                    .id(refund.getRefundId() != null ? refund.getRefundId() : String.valueOf(refund.getId()))
                    .type("Remboursement")
                    .method(refund.getPayment() != null && refund.getPayment().getOperator() != null
                            ? refund.getPayment().getOperator().name()
                            : "-")
                    .amount(safeAmount(refund.getAmount()).negate())
                    .status(mapRefundStatus(refund.getStatus()))
                    .date(refund.getProcessedDate() != null ? refund.getProcessedDate() : refund.getCreatedAt())
                    .build());
        }
        return rows;
    }

    private BigDecimal sumPaymentAmounts(PaymentStatus status, LocalDateTime from) {
        BigDecimal total = BigDecimal.ZERO;
        for (Payment payment : paymentRepository.findByStatus(status)) {
            if (!isAfterOrNullDate(payment.getPaymentDate(), payment.getCreatedAt(), from)) {
                continue;
            }
            total = total.add(safeAmount(payment.getAmount()));
        }
        return total;
    }

    private BigDecimal sumRefundAmounts(String status, LocalDateTime from) {
        BigDecimal total = BigDecimal.ZERO;
        for (Refund refund : refundRepository.findByStatus(status)) {
            if (!isAfterOrNullDate(refund.getProcessedDate(), refund.getCreatedAt(), from)) {
                continue;
            }
            total = total.add(safeAmount(refund.getAmount()));
        }
        return total;
    }

    private boolean isAfterOrNullDate(LocalDateTime primaryDate, LocalDateTime fallbackDate, LocalDateTime from) {
        if (from == null) {
            return true;
        }
        LocalDateTime date = primaryDate != null ? primaryDate : fallbackDate;
        return date == null || !date.isBefore(from);
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
        return Math.max(1, Math.min(size, 200));
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
