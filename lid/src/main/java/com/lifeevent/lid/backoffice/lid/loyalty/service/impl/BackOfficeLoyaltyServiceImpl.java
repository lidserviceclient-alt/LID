package com.lifeevent.lid.backoffice.lid.loyalty.service.impl;

import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyAdjustPointsRequest;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyConfigDto;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyCustomerDto;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyOverviewDto;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyTierDto;
import com.lifeevent.lid.backoffice.lid.loyalty.dto.BackOfficeLoyaltyTransactionDto;
import com.lifeevent.lid.backoffice.lid.loyalty.mapper.BackOfficeLoyaltyConfigMapper;
import com.lifeevent.lid.backoffice.lid.loyalty.mapper.BackOfficeLoyaltyTierMapper;
import com.lifeevent.lid.backoffice.lid.loyalty.service.BackOfficeLoyaltyService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.loyalty.entity.LoyaltyConfig;
import com.lifeevent.lid.loyalty.entity.LoyaltyPointAdjustment;
import com.lifeevent.lid.loyalty.entity.LoyaltyTier;
import com.lifeevent.lid.loyalty.repository.LoyaltyConfigRepository;
import com.lifeevent.lid.loyalty.repository.LoyaltyPointAdjustmentRepository;
import com.lifeevent.lid.loyalty.repository.LoyaltyTierRepository;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BackOfficeLoyaltyServiceImpl implements BackOfficeLoyaltyService {

    private static final double DEFAULT_POINTS_PER_FCFA = 0.001d;
    private static final double DEFAULT_VALUE_PER_POINT_FCFA = 0.1d;
    private static final int DEFAULT_RETENTION_DAYS = 30;

    private final LoyaltyTierRepository loyaltyTierRepository;
    private final LoyaltyConfigRepository loyaltyConfigRepository;
    private final LoyaltyPointAdjustmentRepository loyaltyPointAdjustmentRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final BackOfficeLoyaltyTierMapper backOfficeLoyaltyTierMapper;
    private final BackOfficeLoyaltyConfigMapper backOfficeLoyaltyConfigMapper;

    @Override
    @Transactional(readOnly = true)
    public BackOfficeLoyaltyOverviewDto getOverview() {
        LoyaltyConfig config = getConfigEntityOrDefault();
        List<LoyaltyTier> tiers = getSortedTiers();
        Map<String, Integer> pointsByCustomerId = computePointsByCustomer();

        long pointsDistributed = pointsByCustomerId.values().stream().mapToLong(Integer::longValue).sum();
        long vipMembers = countVipMembers(pointsByCustomerId, tiers);
        double pointsValueFcfa = pointsDistributed * safeDouble(config.getValuePerPointFcfa(), DEFAULT_VALUE_PER_POINT_FCFA);
        double retentionRate = computeRetentionRate(config);

        return BackOfficeLoyaltyOverviewDto.builder()
                .vipMembers(vipMembers)
                .pointsDistributed(pointsDistributed)
                .pointsValueFcfa(pointsValueFcfa)
                .retentionRate(retentionRate)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BackOfficeLoyaltyTierDto> getTiers() {
        List<LoyaltyTier> tiers = getSortedTiers();
        Map<String, Integer> pointsByCustomerId = computePointsByCustomer();
        return toTierDtosWithMembers(tiers, pointsByCustomerId);
    }

    @Override
    public BackOfficeLoyaltyTierDto createTier(BackOfficeLoyaltyTierDto dto) {
        validateTierDto(dto);
        ensureTierNameUnique(dto.getName(), null);

        LoyaltyTier entity = LoyaltyTier.builder()
                .name(dto.getName().trim())
                .minPoints(dto.getMinPoints())
                .benefits(trimToNull(dto.getBenefits()))
                .members(0)
                .build();

        LoyaltyTier saved = loyaltyTierRepository.save(entity);
        return backOfficeLoyaltyTierMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeLoyaltyConfigDto getConfig() {
        return backOfficeLoyaltyConfigMapper.toDto(getConfigEntityOrDefault());
    }

    @Override
    public BackOfficeLoyaltyConfigDto updateConfig(BackOfficeLoyaltyConfigDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Configuration invalide");
        }

        LoyaltyConfig entity = getOrCreateConfigEntity();
        backOfficeLoyaltyConfigMapper.updateEntityFromDto(dto, entity);

        entity.setPointsPerFcfa(safeDouble(entity.getPointsPerFcfa(), DEFAULT_POINTS_PER_FCFA));
        entity.setValuePerPointFcfa(safeDouble(entity.getValuePerPointFcfa(), DEFAULT_VALUE_PER_POINT_FCFA));
        entity.setRetentionDays(normalizeRetentionDays(entity.getRetentionDays()));

        LoyaltyConfig saved = loyaltyConfigRepository.save(entity);
        return backOfficeLoyaltyConfigMapper.toDto(saved);
    }

    @Override
    public BackOfficeLoyaltyTierDto updateTier(Long id, BackOfficeLoyaltyTierDto dto) {
        if (id == null) {
            throw new IllegalArgumentException("Niveau introuvable");
        }
        validateTierDto(dto);

        LoyaltyTier tier = findTierOrThrow(id);
        ensureTierNameUnique(dto.getName(), id);

        tier.setName(dto.getName().trim());
        tier.setMinPoints(dto.getMinPoints());
        tier.setBenefits(trimToNull(dto.getBenefits()));

        LoyaltyTier saved = loyaltyTierRepository.save(tier);
        return backOfficeLoyaltyTierMapper.toDto(saved);
    }

    @Override
    public void deleteTier(Long id) {
        LoyaltyTier tier = findTierOrThrow(id);
        long total = loyaltyTierRepository.count();
        if (total <= 1) {
            throw new IllegalArgumentException("Impossible de supprimer le dernier niveau");
        }
        loyaltyTierRepository.delete(tier);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BackOfficeLoyaltyCustomerDto> topCustomers(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        List<BackOfficeLoyaltyCustomerDto> sorted = getSortedCustomers(null);
        return sorted.stream().limit(safeLimit).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeLoyaltyCustomerDto> searchCustomers(String query, Pageable pageable) {
        List<BackOfficeLoyaltyCustomerDto> sorted = getSortedCustomers(query);
        return paginateList(sorted, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeLoyaltyCustomerDto getCustomer(String userId) {
        Customer customer = findCustomerOrThrow(userId);
        List<LoyaltyTier> tiers = getSortedTiers();

        int points = computeCustomerPoints(userId);
        LoyaltyTier tier = resolveTier(points, tiers);

        return BackOfficeLoyaltyCustomerDto.builder()
                .userId(customer.getUserId())
                .email(customer.getEmail())
                .phone(customer.getPhoneNumber())
                .points(points)
                .tier(tier == null ? null : tier.getName())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeLoyaltyTransactionDto> getTransactions(String userId, Pageable pageable) {
        findCustomerOrThrow(userId);

        List<BackOfficeLoyaltyTransactionDto> transactions = new ArrayList<>();
        transactions.addAll(buildOrderTransactions(userId));
        transactions.addAll(buildAdjustmentTransactions(userId));

        transactions.sort(Comparator.comparing(BackOfficeLoyaltyTransactionDto::getCreatedAt,
                Comparator.nullsLast(LocalDateTime::compareTo)).reversed());

        return paginateList(transactions, pageable);
    }

    @Override
    public BackOfficeLoyaltyCustomerDto adjustPoints(String userId, BackOfficeLoyaltyAdjustPointsRequest request) {
        if (request == null || request.getDeltaPoints() == null) {
            throw new IllegalArgumentException("Requête invalide");
        }
        if (request.getDeltaPoints() == 0) {
            throw new IllegalArgumentException("Delta invalide");
        }

        Customer customer = findCustomerOrThrow(userId);

        int currentPoints = computeCustomerPoints(userId);
        int nextPoints = currentPoints + request.getDeltaPoints();
        if (nextPoints < 0) {
            throw new IllegalArgumentException("Points insuffisants");
        }

        LoyaltyPointAdjustment adjustment = LoyaltyPointAdjustment.builder()
                .customer(customer)
                .deltaPoints(request.getDeltaPoints())
                .reason(trimToNull(request.getReason()))
                .build();
        loyaltyPointAdjustmentRepository.save(adjustment);

        return getCustomer(userId);
    }

    private LoyaltyTier findTierOrThrow(Long id) {
        return loyaltyTierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LoyaltyTier", "id", String.valueOf(id)));
    }

    private Customer findCustomerOrThrow(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("Client introuvable");
        }

        return customerRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Client introuvable"));
    }

    private void validateTierDto(BackOfficeLoyaltyTierDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Niveau invalide");
        }
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Nom obligatoire");
        }
        if (dto.getMinPoints() == null || dto.getMinPoints() < 0) {
            throw new IllegalArgumentException("Points requis invalides");
        }
    }

    private void ensureTierNameUnique(String name, Long ignoredId) {
        loyaltyTierRepository.findByNameIgnoreCase(name.trim()).ifPresent(existing -> {
            if (!Objects.equals(existing.getId(), ignoredId)) {
                throw new IllegalArgumentException("Ce niveau existe déjà");
            }
        });
    }

    private LoyaltyConfig getOrCreateConfigEntity() {
        return loyaltyConfigRepository.findTopByOrderByIdAsc().orElseGet(() ->
                loyaltyConfigRepository.save(defaultConfigEntity())
        );
    }

    private LoyaltyConfig getConfigEntityOrDefault() {
        return loyaltyConfigRepository.findTopByOrderByIdAsc().orElseGet(this::defaultConfigEntity);
    }

    private LoyaltyConfig defaultConfigEntity() {
        return LoyaltyConfig.builder()
                .pointsPerFcfa(DEFAULT_POINTS_PER_FCFA)
                .valuePerPointFcfa(DEFAULT_VALUE_PER_POINT_FCFA)
                .retentionDays(DEFAULT_RETENTION_DAYS)
                .build();
    }

    private List<LoyaltyTier> getSortedTiers() {
        List<LoyaltyTier> tiers = new ArrayList<>(loyaltyTierRepository.findAllByOrderByMinPointsAscNameAsc());
        tiers.sort(Comparator
                .comparing(LoyaltyTier::getMinPoints, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(LoyaltyTier::getName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));
        return tiers;
    }

    private Map<String, Integer> computePointsByCustomer() {
        List<String> customerIds = customerRepository.findAllBasic().stream()
                .map(CustomerRepository.CustomerBasicView::getUserId)
                .filter(Objects::nonNull)
                .toList();
        return computePointsByCustomerIds(customerIds);
    }

    private Map<String, Integer> computePointsByCustomerIds(List<String> customerIds) {
        LoyaltyConfig config = getConfigEntityOrDefault();
        double pointsPerFcfa = safeDouble(config.getPointsPerFcfa(), DEFAULT_POINTS_PER_FCFA);
        if (customerIds == null || customerIds.isEmpty()) {
            return Map.of();
        }

        Map<String, Integer> points = new HashMap<>();
        for (String customerId : customerIds) {
            points.put(customerId, 0);
        }

        for (OrderRepository.CustomerDeliveredAmountView row :
                orderRepository.aggregateAmountByCustomerIdsAndStatus(customerIds, Status.DELIVERED)) {
            if (row.getCustomerId() == null) {
                continue;
            }
            points.put(row.getCustomerId(), toPoints(row.getAmount(), pointsPerFcfa));
        }

        for (LoyaltyPointAdjustmentRepository.CustomerDeltaView row :
                loyaltyPointAdjustmentRepository.sumDeltaByCustomerIds(customerIds)) {
            if (row.getCustomerId() == null) {
                continue;
            }
            int current = points.getOrDefault(row.getCustomerId(), 0);
            long safeDelta = row.getDelta() == null ? 0L : row.getDelta();
            points.put(row.getCustomerId(), Math.max(0, current + (int) safeDelta));
        }

        return points;
    }

    private int computeCustomerPoints(String userId) {
        String safeUserId = trimToNull(userId);
        if (safeUserId == null) {
            return 0;
        }

        LoyaltyConfig config = getConfigEntityOrDefault();
        double pointsPerFcfa = safeDouble(config.getPointsPerFcfa(), DEFAULT_POINTS_PER_FCFA);
        int earned = orderRepository.aggregateAmountByCustomerIdsAndStatus(List.of(safeUserId), Status.DELIVERED).stream()
                .findFirst()
                .map(OrderRepository.CustomerDeliveredAmountView::getAmount)
                .map(amount -> toPoints(amount, pointsPerFcfa))
                .orElse(0);
        int delta = (int) loyaltyPointAdjustmentRepository.sumDeltaByCustomerId(safeUserId);
        return Math.max(0, earned + delta);
    }

    private List<BackOfficeLoyaltyTierDto> toTierDtosWithMembers(List<LoyaltyTier> tiers, Map<String, Integer> pointsByCustomerId) {
        List<BackOfficeLoyaltyTierDto> dtos = new ArrayList<>();
        for (int i = 0; i < tiers.size(); i++) {
            LoyaltyTier tier = tiers.get(i);
            Integer maxExclusive = i + 1 < tiers.size() ? tiers.get(i + 1).getMinPoints() : null;
            int members = countMembersInRange(pointsByCustomerId, tier.getMinPoints(), maxExclusive);

            BackOfficeLoyaltyTierDto dto = backOfficeLoyaltyTierMapper.toDto(tier);
            dto.setMembers(members);
            dtos.add(dto);
        }
        return dtos;
    }

    private int countMembersInRange(Map<String, Integer> pointsByCustomerId, Integer minInclusive, Integer maxExclusive) {
        int min = minInclusive == null ? 0 : minInclusive;
        int count = 0;
        for (int points : pointsByCustomerId.values()) {
            if (points < min) {
                continue;
            }
            if (maxExclusive != null && points >= maxExclusive) {
                continue;
            }
            count++;
        }
        return count;
    }

    private long countVipMembers(Map<String, Integer> pointsByCustomerId, List<LoyaltyTier> tiers) {
        if (tiers.isEmpty()) {
            return 0L;
        }

        int vipThreshold = tiers.size() > 1
                ? tiers.get(1).getMinPoints()
                : (tiers.get(0).getMinPoints() == null ? 0 : tiers.get(0).getMinPoints());

        return pointsByCustomerId.values().stream()
                .filter(points -> points >= vipThreshold)
                .count();
    }

    private double computeRetentionRate(LoyaltyConfig config) {
        int days = normalizeRetentionDays(config.getRetentionDays());
        LocalDateTime from = LocalDateTime.now().minusDays(days);

        Map<String, Integer> counts = new HashMap<>();
        for (OrderRepository.CustomerOrdersCountView row : orderRepository.aggregateOrderCountByCustomerFrom(from)) {
            if (row.getCustomerId() == null) {
                continue;
            }
            long orders = row.getOrders() == null ? 0L : row.getOrders();
            counts.put(row.getCustomerId(), (int) Math.min(Integer.MAX_VALUE, Math.max(0L, orders)));
        }

        long clients = counts.size();
        if (clients == 0) {
            return 0d;
        }

        long repeatClients = counts.values().stream().filter(count -> count > 1).count();
        return (repeatClients * 100.0d) / clients;
    }

    private List<BackOfficeLoyaltyCustomerDto> getSortedCustomers(String query) {
        List<LoyaltyTier> tiers = getSortedTiers();
        String normalizedQuery = trimToNull(query);
        List<CustomerRepository.CustomerBasicView> customerViews = normalizedQuery == null
                ? customerRepository.findAllBasic()
                : customerRepository.searchBasic(normalizedQuery);
        List<String> customerIds = customerViews.stream()
                .map(CustomerRepository.CustomerBasicView::getUserId)
                .filter(Objects::nonNull)
                .toList();
        Map<String, Integer> pointsByCustomerId = computePointsByCustomerIds(customerIds);

        List<BackOfficeLoyaltyCustomerDto> customers = new ArrayList<>();
        for (CustomerRepository.CustomerBasicView customer : customerViews) {
            if (customer.getUserId() == null) {
                continue;
            }

            int points = pointsByCustomerId.getOrDefault(customer.getUserId(), 0);
            LoyaltyTier tier = resolveTier(points, tiers);
            customers.add(BackOfficeLoyaltyCustomerDto.builder()
                    .userId(customer.getUserId())
                    .email(customer.getEmail())
                    .phone(customer.getPhoneNumber())
                    .points(points)
                    .tier(tier == null ? null : tier.getName())
                    .build());
        }

        customers.sort(Comparator
                .comparing(BackOfficeLoyaltyCustomerDto::getPoints, Comparator.nullsLast(Integer::compareTo)).reversed()
                .thenComparing(BackOfficeLoyaltyCustomerDto::getEmail, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));

        return customers;
    }

    private LoyaltyTier resolveTier(int points, List<LoyaltyTier> sortedTiers) {
        LoyaltyTier best = null;
        for (LoyaltyTier tier : sortedTiers) {
            if (tier.getMinPoints() == null) {
                continue;
            }
            if (points >= tier.getMinPoints()) {
                best = tier;
            }
        }
        return best;
    }

    private List<BackOfficeLoyaltyTransactionDto> buildOrderTransactions(String userId) {
        LoyaltyConfig config = getConfigEntityOrDefault();
        double pointsPerFcfa = safeDouble(config.getPointsPerFcfa(), DEFAULT_POINTS_PER_FCFA);

        List<BackOfficeLoyaltyTransactionDto> items = new ArrayList<>();
        for (Order order : orderRepository.findByCustomer_UserId(userId)) {
            if (!isDelivered(order)) {
                continue;
            }

            items.add(BackOfficeLoyaltyTransactionDto.builder()
                    .id("order-" + order.getId())
                    .type("ORDER")
                    .points(toPoints(order.getAmount(), pointsPerFcfa))
                    .reason("Commande livrée")
                    .orderId(order.getId() == null ? null : String.valueOf(order.getId()))
                    .createdAt(order.getDeliveryDate() != null ? order.getDeliveryDate() : order.getCreatedAt())
                    .build());
        }
        return items;
    }

    private List<BackOfficeLoyaltyTransactionDto> buildAdjustmentTransactions(String userId) {
        List<BackOfficeLoyaltyTransactionDto> items = new ArrayList<>();
        for (LoyaltyPointAdjustment adjustment : loyaltyPointAdjustmentRepository.findByCustomer_UserIdOrderByCreatedAtDesc(userId)) {
            items.add(BackOfficeLoyaltyTransactionDto.builder()
                    .id("adjust-" + adjustment.getId())
                    .type("ADJUSTMENT")
                    .points(adjustment.getDeltaPoints())
                    .reason(adjustment.getReason())
                    .orderId(null)
                    .createdAt(adjustment.getCreatedAt())
                    .build());
        }
        return items;
    }

    private <T> Page<T> paginateList(List<T> items, Pageable pageable) {
        int page = Math.max(0, pageable.getPageNumber());
        int size = Math.max(1, pageable.getPageSize());

        int fromIndex = page * size;
        if (fromIndex >= items.size()) {
            return new PageImpl<>(List.of(), pageable, items.size());
        }

        int toIndex = Math.min(items.size(), fromIndex + size);
        return new PageImpl<>(items.subList(fromIndex, toIndex), pageable, items.size());
    }

    private boolean isDelivered(Order order) {
        return order != null && order.getCurrentStatus() == Status.DELIVERED;
    }

    private int toPoints(Double amount, double pointsPerFcfa) {
        if (amount == null || amount <= 0) {
            return 0;
        }
        return (int) Math.floor(amount * pointsPerFcfa);
    }

    private int normalizeRetentionDays(Integer retentionDays) {
        if (retentionDays == null) {
            return DEFAULT_RETENTION_DAYS;
        }
        return Math.max(1, Math.min(retentionDays, 365));
    }

    private double safeDouble(Double value, double fallback) {
        return value == null ? fallback : value;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

}
