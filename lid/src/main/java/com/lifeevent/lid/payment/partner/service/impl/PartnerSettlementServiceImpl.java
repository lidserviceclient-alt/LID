package com.lifeevent.lid.payment.partner.service.impl;

import com.lifeevent.lid.backoffice.lid.partner.dto.BackOfficePartnerTransactionDto;
import com.lifeevent.lid.backoffice.lid.setting.entity.BackOfficeAppConfigEntity;
import com.lifeevent.lid.backoffice.lid.setting.entity.PartnerSettlementMode;
import com.lifeevent.lid.backoffice.lid.setting.repository.BackOfficeAppConfigRepository;
import com.lifeevent.lid.common.dto.PageResponse;
import com.lifeevent.lid.common.util.PhoneNumberUtils;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.OrderArticle;
import com.lifeevent.lid.order.entity.ReturnRequest;
import com.lifeevent.lid.order.entity.ReturnRequestItem;
import com.lifeevent.lid.order.enumeration.ReturnRequestStatus;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.order.repository.ReturnRequestRepository;
import com.lifeevent.lid.payment.entity.Payment;
import com.lifeevent.lid.payment.disbursement.dto.PaydunyaDisbursementResult;
import com.lifeevent.lid.payment.disbursement.service.PaydunyaDisbursementService;
import com.lifeevent.lid.payment.enums.PaymentStatus;
import com.lifeevent.lid.payment.partner.entity.PartnerSettlement;
import com.lifeevent.lid.payment.partner.entity.PartnerSettlementStatus;
import com.lifeevent.lid.payment.partner.repository.PartnerSettlementRepository;
import com.lifeevent.lid.payment.partner.service.PartnerSettlementService;
import com.lifeevent.lid.payment.repository.PaymentRepository;
import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class PartnerSettlementServiceImpl implements PartnerSettlementService {

    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    private static final Set<ReturnRequestStatus> QUALIFYING_RETURN_STATUSES = EnumSet.of(
            ReturnRequestStatus.APPROVED,
            ReturnRequestStatus.REFUNDED,
            ReturnRequestStatus.COMPLETED,
            ReturnRequestStatus.CLOSED
    );
    private static final PartnerSettlementMode DEFAULT_PARTNER_SETTLEMENT_MODE = PartnerSettlementMode.DEDUCT_SHIPPING_AND_RETURN_COST;
    private static final int DEFAULT_RETURN_WINDOW_MAX = 30;
    private static final String DEFAULT_RETURN_WINDOW_UNIT = "DAYS";
    private static final int MAX_PAGE_SIZE = 200;

    private final PartnerSettlementRepository partnerSettlementRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final PartnerRepository partnerRepository;
    private final BackOfficeAppConfigRepository appConfigRepository;
    private final PaydunyaDisbursementService paydunyaDisbursementService;

    @Override
    public void syncOrderSettlements(Long orderId) {
        if (orderId == null) {
            return;
        }

        Order order = orderRepository.findWithCustomerAndArticlesById(orderId).orElse(null);
        if (order == null) {
            partnerSettlementRepository.deleteByOrderId(orderId);
            return;
        }

        Payment payment = paymentRepository.findTopByOrderIdAndStatusOrderByPaymentDateDescCreatedAtDesc(orderId, PaymentStatus.COMPLETED)
                .orElse(null);
        if (payment == null) {
            partnerSettlementRepository.deleteByOrderId(orderId);
            return;
        }

        Map<String, BigDecimal> partnerGrossById = aggregatePartnerGross(order.getArticles());
        if (partnerGrossById.isEmpty()) {
            partnerSettlementRepository.deleteByOrderId(orderId);
            return;
        }

        BackOfficeAppConfigEntity config = appConfigRepository.findTopByOrderByIdAsc().orElse(null);
        BigDecimal shippingCost = money(order.getShippingCost());
        BigDecimal orderSubtotal = money(sumOrderSubtotal(order.getArticles()));
        BigDecimal orderAmount = money(order.getAmount());
        BigDecimal totalDiscount = orderSubtotal.add(shippingCost).subtract(orderAmount).max(ZERO);
        BigDecimal partnerMarginPercent = percent(config == null ? null : config.getPartnerMarginPercent());
        BigDecimal returnShippingCost = money(config == null ? null : config.getReturnShippingCostAmount());
        PartnerSettlementMode settlementMode = config == null || config.getPartnerSettlementMode() == null
                ? DEFAULT_PARTNER_SETTLEMENT_MODE
                : config.getPartnerSettlementMode();
        String returnWindowUnit = normalizeWindowUnit(config == null ? null : config.getReturnWindowUnit());
        int returnWindowMax = normalizeWindowMax(config == null ? null : config.getReturnWindowMax());
        LocalDateTime transactionDate = payment.getPaymentDate() != null ? payment.getPaymentDate() : payment.getCreatedAt();
        LocalDateTime eligibleAt = applyWindow(transactionDate != null ? transactionDate : LocalDateTime.now(), returnWindowUnit, returnWindowMax);

        Map<String, Partner> partnersById = resolvePartners(partnerGrossById.keySet());
        Map<String, String> partnerNames = resolvePartnerNames(partnersById);
        Map<Long, OrderArticle> orderArticlesById = indexOrderArticles(order.getArticles());
        Map<Long, Integer> cappedReturnedQuantities = resolveReturnedQuantities(orderArticlesById, orderId);
        Map<String, BigDecimal> returnedGrossByPartnerId = aggregateReturnedGrossByPartner(orderArticlesById, cappedReturnedQuantities);
        BigDecimal totalReturnedPartnerGross = returnedGrossByPartnerId.values().stream().reduce(ZERO, BigDecimal::add);
        boolean hasPartnerReturn = totalReturnedPartnerGross.compareTo(ZERO) > 0;
        boolean eligibleNow = eligibleAt != null && !eligibleAt.isAfter(LocalDateTime.now());

        Map<String, PartnerSettlement> existingByPartnerId = new HashMap<>();
        for (PartnerSettlement settlement : partnerSettlementRepository.findByOrderId(orderId)) {
            existingByPartnerId.put(settlement.getPartnerId(), settlement);
        }

        for (Map.Entry<String, BigDecimal> entry : partnerGrossById.entrySet()) {
            String partnerId = entry.getKey();
            BigDecimal grossAmount = money(entry.getValue());
            BigDecimal discountAllocation = allocate(totalDiscount, grossAmount, orderSubtotal);
            BigDecimal discountedGross = grossAmount.subtract(discountAllocation).max(ZERO);
            BigDecimal shippingAllocation = allocate(shippingCost, grossAmount, orderSubtotal);
            BigDecimal returnedGross = money(returnedGrossByPartnerId.get(partnerId));
            BigDecimal returnCostAllocation = hasPartnerReturn
                    ? allocate(returnShippingCost, returnedGross, totalReturnedPartnerGross)
                    : ZERO;

            boolean returnedPartner = returnedGross.compareTo(ZERO) > 0;
            BigDecimal effectiveMarginPercent = returnedPartner ? ZERO : partnerMarginPercent;
            BigDecimal netBeforeMargin = discountedGross.subtract(shippingAllocation).max(ZERO);
            BigDecimal marginAmount = returnedPartner ? ZERO : money(netBeforeMargin.multiply(effectiveMarginPercent));
            BigDecimal netAmount = returnedPartner
                    ? discountedGross.subtract(shippingAllocation).subtract(returnCostAllocation).max(ZERO)
                    : discountedGross.subtract(shippingAllocation).subtract(marginAmount).max(ZERO);

            PartnerSettlementStatus payoutStatus = returnedPartner
                    ? PartnerSettlementStatus.RETURN_ADJUSTED
                    : (eligibleNow ? PartnerSettlementStatus.ELIGIBLE : PartnerSettlementStatus.PENDING_WINDOW);
            PartnerSettlement settlement = existingByPartnerId.getOrDefault(partnerId, PartnerSettlement.builder().build());
            if (settlement.getPayoutStatus() == PartnerSettlementStatus.PAID && !returnedPartner) {
                payoutStatus = PartnerSettlementStatus.PAID;
            }
            settlement.setOrderId(orderId);
            settlement.setPaymentId(payment.getId());
            settlement.setPartnerId(partnerId);
            settlement.setPartnerName(partnerNames.getOrDefault(partnerId, partnerId));
            settlement.setCurrency(normalizeCurrency(payment.getCurrency()));
            settlement.setGrossAmount(grossAmount);
            settlement.setDiscountAllocation(discountAllocation);
            settlement.setShippingAllocation(shippingAllocation);
            settlement.setReturnCostAllocation(
                    settlementMode == PartnerSettlementMode.DEDUCT_SHIPPING_AND_RETURN_COST ? returnCostAllocation : ZERO
            );
            settlement.setMarginPercent(effectiveMarginPercent);
            settlement.setMarginAmount(marginAmount);
            settlement.setNetAmount(netAmount);
            settlement.setTransactionDate(transactionDate != null ? transactionDate : order.getCreatedAt());
            settlement.setEligibleAt(eligibleAt);
            settlement.setLastCalculatedAt(LocalDateTime.now());
            settlement.setPayoutStatus(payoutStatus);
            if (settlement.getPayoutStatus() != PartnerSettlementStatus.PAID) {
                settlement.setPaidOutAt(null);
                settlement.setPayoutReference(null);
            }
            if (!returnedPartner) {
                attemptPartnerPayout(settlement, partnersById.get(partnerId), config);
            }
            partnerSettlementRepository.save(settlement);
        }

        partnerSettlementRepository.deleteByOrderIdAndPartnerIdNotIn(orderId, partnerGrossById.keySet());
    }

    @Override
    public PageResponse<BackOfficePartnerTransactionDto> listPartnerTransactions(
            String partnerId,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size
    ) {
        partnerSettlementRepository.promoteEligible(
                LocalDateTime.now(),
                PartnerSettlementStatus.PENDING_WINDOW,
                PartnerSettlementStatus.ELIGIBLE
        );
        LocalDateTime from = startOfDay(fromDate);
        LocalDateTime to = endExclusive(toDate);
        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.max(1, Math.min(size, MAX_PAGE_SIZE)),
                Sort.by(Sort.Direction.DESC, "transactionDate").and(Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return PageResponse.from(
                partnerSettlementRepository.findTransactionViews(partnerId, from, to, pageable)
                        .map(this::toDto)
        );
    }

    private Map<String, BigDecimal> aggregatePartnerGross(List<OrderArticle> lines) {
        Map<String, BigDecimal> grossByPartner = new LinkedHashMap<>();
        if (lines == null) {
            return grossByPartner;
        }
        for (OrderArticle line : lines) {
            if (line == null || line.getArticle() == null) {
                continue;
            }
            String partnerId = trimToNull(line.getArticle().getReferencePartner());
            if (partnerId == null) {
                continue;
            }
            BigDecimal lineTotal = money((line.getPriceAtOrder() == null ? 0d : line.getPriceAtOrder()) * Math.max(0, line.getQuantity() == null ? 0 : line.getQuantity()));
            grossByPartner.merge(partnerId, lineTotal, BigDecimal::add);
        }
        grossByPartner.replaceAll((key, value) -> money(value));
        return grossByPartner;
    }

    private Map<Long, OrderArticle> indexOrderArticles(List<OrderArticle> lines) {
        Map<Long, OrderArticle> map = new HashMap<>();
        if (lines == null) {
            return map;
        }
        for (OrderArticle line : lines) {
            if (line == null || line.getArticle() == null || line.getArticle().getId() == null) {
                continue;
            }
            map.put(line.getArticle().getId(), line);
        }
        return map;
    }

    private Map<Long, Integer> resolveReturnedQuantities(Map<Long, OrderArticle> orderArticlesById, Long orderId) {
        Map<Long, Integer> requestedQuantities = new HashMap<>();
        List<ReturnRequest> returns = returnRequestRepository.findByOrderIdAndStatusIn(orderId, QUALIFYING_RETURN_STATUSES);
        for (ReturnRequest request : returns) {
            if (request.getItems() == null) {
                continue;
            }
            for (ReturnRequestItem item : request.getItems()) {
                if (item == null || item.getArticleId() == null) {
                    continue;
                }
                requestedQuantities.merge(item.getArticleId(), Math.max(0, item.getQuantity() == null ? 0 : item.getQuantity()), Integer::sum);
            }
        }

        Map<Long, Integer> capped = new HashMap<>();
        for (Map.Entry<Long, Integer> entry : requestedQuantities.entrySet()) {
            OrderArticle orderArticle = orderArticlesById.get(entry.getKey());
            if (orderArticle == null) {
                continue;
            }
            int orderedQuantity = Math.max(0, orderArticle.getQuantity() == null ? 0 : orderArticle.getQuantity());
            capped.put(entry.getKey(), Math.min(orderedQuantity, Math.max(0, entry.getValue())));
        }
        return capped;
    }

    private Map<String, BigDecimal> aggregateReturnedGrossByPartner(
            Map<Long, OrderArticle> orderArticlesById,
            Map<Long, Integer> returnedQuantities
    ) {
        Map<String, BigDecimal> returnedGrossByPartner = new HashMap<>();
        for (Map.Entry<Long, Integer> entry : returnedQuantities.entrySet()) {
            OrderArticle orderArticle = orderArticlesById.get(entry.getKey());
            if (orderArticle == null || orderArticle.getArticle() == null) {
                continue;
            }
            String partnerId = trimToNull(orderArticle.getArticle().getReferencePartner());
            if (partnerId == null) {
                continue;
            }
            BigDecimal returnedGross = money((orderArticle.getPriceAtOrder() == null ? 0d : orderArticle.getPriceAtOrder()) * Math.max(0, entry.getValue()));
            returnedGrossByPartner.merge(partnerId, returnedGross, BigDecimal::add);
        }
        returnedGrossByPartner.replaceAll((key, value) -> money(value));
        return returnedGrossByPartner;
    }

    private Map<String, String> resolvePartnerNames(Map<String, Partner> partnersById) {
        Map<String, String> names = new HashMap<>();
        for (Partner partner : partnersById.values()) {
            String firstName = trimToNull(partner.getFirstName());
            String lastName = trimToNull(partner.getLastName());
            String fullName = ((firstName == null ? "" : firstName) + " " + (lastName == null ? "" : lastName)).trim();
            names.put(partner.getUserId(), fullName.isBlank() ? partner.getUserId() : fullName);
        }
        return names;
    }

    private Map<String, Partner> resolvePartners(Collection<String> partnerIds) {
        Map<String, Partner> partners = new LinkedHashMap<>();
        if (partnerIds == null || partnerIds.isEmpty()) {
            return partners;
        }
        for (Partner partner : partnerRepository.findAllById(partnerIds)) {
            partners.put(partner.getUserId(), partner);
        }
        return partners;
    }

    private double sumOrderSubtotal(List<OrderArticle> lines) {
        if (lines == null) {
            return 0d;
        }
        double total = 0d;
        for (OrderArticle line : lines) {
            if (line == null) {
                continue;
            }
            total += (line.getPriceAtOrder() == null ? 0d : line.getPriceAtOrder()) * Math.max(0, line.getQuantity() == null ? 0 : line.getQuantity());
        }
        return total;
    }

    private BackOfficePartnerTransactionDto toDto(PartnerSettlementRepository.PartnerTransactionView view) {
        return new BackOfficePartnerTransactionDto(
                view.getId(),
                view.getOrderId(),
                view.getPartnerId(),
                view.getPartnerName(),
                view.getCurrency(),
                money(view.getGrossAmount()),
                money(view.getDiscountAllocation()),
                money(view.getShippingAllocation()),
                money(view.getReturnCostAllocation()),
                percent(view.getMarginPercent()),
                money(view.getMarginAmount()),
                money(view.getNetAmount()),
                view.getTransactionDate(),
                view.getEligibleAt(),
                view.getPaidOutAt(),
                view.getPayoutReference(),
                view.getPayoutStatus()
        );
    }

    private void attemptPartnerPayout(PartnerSettlement settlement, Partner partner, BackOfficeAppConfigEntity config) {
        if (settlement == null || partner == null || config == null) {
            return;
        }
        if (settlement.getPayoutStatus() != PartnerSettlementStatus.ELIGIBLE) {
            return;
        }
        String withdrawMode = trimToNull(config.getPartnerPayoutWithdrawMode());
        if (withdrawMode == null) {
            return;
        }
        String accountAlias = PhoneNumberUtils.toNationalSignificantNumberOrNull(partner.getPhoneNumber());
        if (accountAlias == null || accountAlias.isBlank()) {
            return;
        }
        try {
            PaydunyaDisbursementResult result = paydunyaDisbursementService.disburse(
                    accountAlias,
                    settlement.getNetAmount(),
                    withdrawMode,
                    "PARTNER-" + settlement.getOrderId() + "-" + settlement.getPartnerId()
            );
            if (result.success()) {
                settlement.setPayoutStatus(PartnerSettlementStatus.PAID);
                settlement.setPaidOutAt(LocalDateTime.now());
                settlement.setPayoutReference(result.transactionId() == null || result.transactionId().isBlank()
                        ? result.disburseInvoice()
                        : result.transactionId());
            }
        } catch (Exception ignored) {
            // laisse le settlement en ELIGIBLE pour reprise
        }
    }

    private BigDecimal allocate(BigDecimal total, BigDecimal part, BigDecimal whole) {
        if (total == null || part == null || whole == null || total.compareTo(ZERO) <= 0 || part.compareTo(ZERO) <= 0 || whole.compareTo(ZERO) <= 0) {
            return ZERO;
        }
        return money(total.multiply(part).divide(whole, 8, RoundingMode.HALF_UP));
    }

    private BigDecimal money(Double value) {
        if (value == null || !Double.isFinite(value)) {
            return ZERO;
        }
        return money(BigDecimal.valueOf(value));
    }

    private BigDecimal money(BigDecimal value) {
        if (value == null) {
            return ZERO;
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal percent(Double value) {
        if (value == null || !Double.isFinite(value) || value < 0d) {
            return BigDecimal.ZERO.setScale(6, RoundingMode.HALF_UP);
        }
        BigDecimal normalized = BigDecimal.valueOf(value > 1d ? value / 100d : value);
        return normalized.max(BigDecimal.ZERO).setScale(6, RoundingMode.HALF_UP);
    }

    private BigDecimal percent(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(6, RoundingMode.HALF_UP);
        }
        return value.max(BigDecimal.ZERO).setScale(6, RoundingMode.HALF_UP);
    }

    private LocalDateTime applyWindow(LocalDateTime base, String unit, int amount) {
        if (base == null) {
            return null;
        }
        return switch (normalizeWindowUnit(unit)) {
            case "HOURS" -> base.plusHours(Math.max(amount, 1));
            default -> base.plusDays(Math.max(amount, 1));
        };
    }

    private String normalizeWindowUnit(String raw) {
        String normalized = raw == null ? "" : raw.trim().toUpperCase(Locale.ROOT);
        return "HOURS".equals(normalized) ? "HOURS" : DEFAULT_RETURN_WINDOW_UNIT;
    }

    private int normalizeWindowMax(Integer raw) {
        return raw == null || raw <= 0 ? DEFAULT_RETURN_WINDOW_MAX : raw;
    }

    private LocalDateTime startOfDay(LocalDate date) {
        LocalDate safe = date == null ? LocalDate.now() : date;
        return safe.atStartOfDay();
    }

    private LocalDateTime endExclusive(LocalDate date) {
        LocalDate safe = date == null ? LocalDate.now() : date;
        return safe.plusDays(1).atStartOfDay();
    }

    private String normalizeCurrency(String raw) {
        String normalized = trimToNull(raw);
        return normalized == null ? "XOF" : normalized;
    }

    private String trimToNull(String raw) {
        if (raw == null) {
            return null;
        }
        String trimmed = raw.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

}
