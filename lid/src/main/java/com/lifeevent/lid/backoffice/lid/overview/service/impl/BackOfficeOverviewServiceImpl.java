package com.lifeevent.lid.backoffice.lid.overview.service.impl;

import com.lifeevent.lid.auth.constant.UserRole;
import com.lifeevent.lid.auth.entity.Authentication;
import com.lifeevent.lid.auth.repository.AuthenticationRepository;
import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeOrderSummaryDto;
import com.lifeevent.lid.backoffice.lid.order.service.BackOfficeOrderService;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeDashboardResponseDto;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeOverviewDto;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeOverviewLowStockItemDto;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeOverviewOrderPipelineStepDto;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeOverviewOrderSummaryDto;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeOverviewTeamActivityItemDto;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeOverviewTeamMemberPerformanceDto;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeOverviewTeamProductivityDto;
import com.lifeevent.lid.backoffice.lid.overview.dto.BackOfficeOverviewTopProductDto;
import com.lifeevent.lid.backoffice.lid.overview.service.BackOfficeOverviewService;
import com.lifeevent.lid.backoffice.lid.promo.dto.PromoCodeStatsDto;
import com.lifeevent.lid.backoffice.lid.promo.service.BackOfficePromoCodeService;
import com.lifeevent.lid.backoffice.lid.setting.entity.SecurityActivityEntity;
import com.lifeevent.lid.backoffice.lid.setting.repository.SecurityActivityRepository;
import com.lifeevent.lid.common.cache.CatalogCacheNames;
import com.lifeevent.lid.logistics.entity.Shipment;
import com.lifeevent.lid.logistics.repository.ShipmentRepository;
import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.order.repository.OrderArticleRepository;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.stock.entity.Stock;
import com.lifeevent.lid.stock.repository.StockRepository;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeOverviewServiceImpl implements BackOfficeOverviewService {

    private static final int LOW_STOCK_THRESHOLD = 10;
    private static final int SERIES_DAYS_DEFAULT = 12;
    private static final int SERIES_DAYS_MAX = 365;
    private static final long AGGREGATION_TIMEOUT_SECONDS = 8L;

    private final BackOfficeOrderService backOfficeOrderService;
    private final OrderRepository orderRepository;
    private final OrderArticleRepository orderArticleRepository;
    private final ShipmentRepository shipmentRepository;
    private final StockRepository stockRepository;
    private final ArticleRepository articleRepository;
    private final SecurityActivityRepository securityActivityRepository;
    private final CustomerRepository customerRepository;
    private final BackOfficePromoCodeService backOfficePromoCodeService;
    private final AuthenticationRepository authenticationRepository;
    private final PlatformTransactionManager transactionManager;
    @Resource(name = "aggregatorExecutor")
    private Executor aggregatorExecutor;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CatalogCacheNames.BACKOFFICE_OVERVIEW_DASHBOARD, sync = true)
    public BackOfficeDashboardResponseDto getDashboard() {
        CompletableFuture<Long> totalOrdersFuture = supplyOverviewAsync(orderRepository::count);
        CompletableFuture<Double> totalRevenueFuture = supplyOverviewAsync(orderRepository::sumAmount);
        CompletableFuture<Long> pendingOrdersFuture = supplyOverviewAsync(() -> orderRepository.countByCurrentStatus(Status.PENDING));
        CompletableFuture<Long> activeProductsFuture = supplyOverviewAsync(
                () -> articleRepository.countByStatus(ArticleStatus.ACTIVE)
        );
        CompletableFuture<Long> customersFuture = supplyOverviewAsync(customerRepository::count);
        CompletableFuture<Long> lowStockFuture = supplyOverviewAsync(
                () -> stockRepository.countByQuantityAvailableLessThan(LOW_STOCK_THRESHOLD)
        );

        CompletableFuture.allOf(
                totalOrdersFuture,
                totalRevenueFuture,
                pendingOrdersFuture,
                activeProductsFuture,
                customersFuture,
                lowStockFuture
        ).join();

        return BackOfficeDashboardResponseDto.builder()
                .totalOrders(totalOrdersFuture.join())
                .totalRevenue(totalRevenueFuture.join())
                .pendingOrders(pendingOrdersFuture.join())
                .activeProducts(activeProductsFuture.join())
                .customers(customersFuture.join())
                .lowStock(lowStockFuture.join())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = CatalogCacheNames.BACKOFFICE_OVERVIEW_COLLECTION,
            key = "#days == null ? 12 : #days",
            sync = true
    )
    public BackOfficeOverviewDto getOverview(Integer days) {
        int seriesDays = normalizeDays(days);
        CompletableFuture<BackOfficeDashboardResponseDto> dashboardFuture = supplyOverviewAsync(this::getDashboard);
        CompletableFuture<List<BackOfficeOverviewOrderSummaryDto>> recentOrdersFuture = supplyOverviewAsync(this::buildRecentOrders);
        CompletableFuture<List<BackOfficeOverviewOrderPipelineStepDto>> orderPipelineFuture = supplyOverviewAsync(this::buildOrderPipeline);
        CompletableFuture<List<Integer>> analyticsSeriesFuture = supplyOverviewAsync(() -> buildAnalyticsSeries(seriesDays));
        CompletableFuture<List<Integer>> promoUsageSeriesFuture = supplyOverviewAsync(() -> buildPromoUsageSeries(seriesDays));
        CompletableFuture<List<BackOfficeOverviewLowStockItemDto>> lowStockFuture = supplyOverviewAsync(this::buildLowStock);
        CompletableFuture<List<BackOfficeOverviewTopProductDto>> topProductsFuture = supplyOverviewAsync(this::buildTopProducts);
        CompletableFuture<List<BackOfficeOverviewTeamActivityItemDto>> teamActivityFuture = supplyOverviewAsync(this::buildTeamActivity);
        CompletableFuture<BackOfficeOverviewTeamProductivityDto> teamProductivityFuture = supplyOverviewAsync(this::buildTeamProductivity);

        CompletableFuture.allOf(
                dashboardFuture,
                recentOrdersFuture,
                orderPipelineFuture,
                analyticsSeriesFuture,
                promoUsageSeriesFuture,
                lowStockFuture,
                topProductsFuture,
                teamActivityFuture,
                teamProductivityFuture
        ).join();

        return BackOfficeOverviewDto.builder()
                .dashboard(dashboardFuture.join())
                .recentOrders(recentOrdersFuture.join())
                .orderPipeline(orderPipelineFuture.join())
                .analyticsSeries(analyticsSeriesFuture.join())
                .promoUsageSeries(promoUsageSeriesFuture.join())
                .lowStock(lowStockFuture.join())
                .topProducts(topProductsFuture.join())
                .teamActivity(teamActivityFuture.join())
                .teamProductivity(teamProductivityFuture.join())
                .build();
    }

    private <T> CompletableFuture<T> supplyOverviewAsync(Supplier<T> supplier) {
        return CompletableFuture.supplyAsync(() -> {
                    TransactionTemplate tx = new TransactionTemplate(transactionManager);
                    tx.setReadOnly(true);
                    return tx.execute(status -> supplier.get());
                }, aggregatorExecutor)
                .orTimeout(AGGREGATION_TIMEOUT_SECONDS, TimeUnit.SECONDS);
    }

    private int normalizeDays(Integer days) {
        if (days == null) {
            return SERIES_DAYS_DEFAULT;
        }
        return Math.max(1, Math.min(days, SERIES_DAYS_MAX));
    }

    private List<BackOfficeOverviewOrderSummaryDto> buildRecentOrders() {
        List<BackOfficeOrderSummaryDto> recent = backOfficeOrderService.getRecentOrders();
        List<String> orderIds = recent.stream()
                .map(BackOfficeOrderSummaryDto::getId)
                .filter(Objects::nonNull)
                .map(String::valueOf)
                .toList();
        Map<String, Shipment> shipmentsByOrder = new HashMap<>();
        if (!orderIds.isEmpty()) {
            for (Shipment shipment : shipmentRepository.findByOrderIdIn(orderIds)) {
                if (shipment != null && shipment.getOrderId() != null) {
                    shipmentsByOrder.put(shipment.getOrderId(), shipment);
                }
            }
        }

        List<BackOfficeOverviewOrderSummaryDto> rows = new ArrayList<>();
        for (BackOfficeOrderSummaryDto row : recent) {
            String orderId = row.getId() == null ? null : String.valueOf(row.getId());
            Shipment shipment = orderId == null ? null : shipmentsByOrder.get(orderId);
            rows.add(BackOfficeOverviewOrderSummaryDto.builder()
                    .id(orderId)
                    .customer(row.getCustomer())
                    .items(row.getItems())
                    .total(row.getTotal())
                    .status(row.getStatus() == null ? null : row.getStatus().name())
                    .shipmentStatus(shipment == null || shipment.getStatus() == null ? null : shipment.getStatus().name())
                    .courierReference(shipment == null ? null : shipment.getCourierReference())
                    .courierName(shipment == null ? null : shipment.getCourierName())
                    .courierPhone(shipment == null ? null : shipment.getCourierPhone())
                    .courierUser(shipment == null ? null : shipment.getCourierUser())
                    .courierScannedAt(shipment == null ? null : shipment.getScannedAt())
                    .dateCreation(row.getDateCreation())
                    .build());
        }
        return rows;
    }

    private List<BackOfficeOverviewOrderPipelineStepDto> buildOrderPipeline() {
        long nouvelles = orderRepository.countByCurrentStatus(Status.PENDING);
        long preparation = orderRepository.countByCurrentStatusIn(List.of(Status.PAID, Status.PROCESSING));
        long expediees = orderRepository.countByCurrentStatusIn(List.of(Status.READY_TO_DELIVER, Status.DELIVERY_IN_PROGRESS));
        long retours = orderRepository.countByCurrentStatusIn(List.of(Status.REFUNDED, Status.CANCELED));

        return List.of(
                BackOfficeOverviewOrderPipelineStepDto.builder().label("Nouvelles").value(nouvelles).build(),
                BackOfficeOverviewOrderPipelineStepDto.builder().label("En preparation").value(preparation).build(),
                BackOfficeOverviewOrderPipelineStepDto.builder().label("Expediees").value(expediees).build(),
                BackOfficeOverviewOrderPipelineStepDto.builder().label("Retours").value(retours).build()
        );
    }

    private List<Integer> buildAnalyticsSeries(int days) {
        LocalDate start = LocalDate.now().minusDays(days - 1L);
        Map<LocalDate, Integer> byDay = new HashMap<>();
        LocalDateTime from = start.atStartOfDay();
        for (OrderRepository.DailyOrdersCountView row : orderRepository.aggregateOrderCountByDayFrom(from)) {
            if (row.getDay() == null) {
                continue;
            }
            long count = row.getOrders() == null ? 0L : row.getOrders();
            byDay.put(row.getDay(), (int) Math.min(Integer.MAX_VALUE, Math.max(0L, count)));
        }

        List<Integer> series = new ArrayList<>(days);
        for (int i = 0; i < days; i++) {
            LocalDate day = start.plusDays(i);
            series.add(byDay.getOrDefault(day, 0));
        }
        return series;
    }

    private List<Integer> buildPromoUsageSeries(int days) {
        PromoCodeStatsDto stats = backOfficePromoCodeService.getStats(days);
        List<Long> usageSeries = stats == null ? List.of() : stats.getUsageSeries();
        List<Integer> series = new ArrayList<>(days);

        for (int i = 0; i < days; i++) {
            long value = (usageSeries != null && i < usageSeries.size() && usageSeries.get(i) != null)
                    ? usageSeries.get(i)
                    : 0L;
            series.add((int) Math.min(Integer.MAX_VALUE, Math.max(0L, value)));
        }
        return series;
    }

    private List<BackOfficeOverviewLowStockItemDto> buildLowStock() {
        List<BackOfficeOverviewLowStockItemDto> rows = new ArrayList<>();
        List<Stock> lowStocks = stockRepository
                .findByQuantityAvailableLessThanOrderByQuantityAvailableAsc(LOW_STOCK_THRESHOLD, PageRequest.of(0, 5))
                .getContent();

        for (Stock stock : lowStocks) {
            Article article = stock.getArticle();
            rows.add(BackOfficeOverviewLowStockItemDto.builder()
                    .name(article == null ? null : article.getName())
                    .sku(article == null ? null : article.getSku())
                    .stock(stock.getQuantityAvailable())
                    .threshold(LOW_STOCK_THRESHOLD)
                    .supplier(article == null ? null : article.getBrand())
                    .build());
        }

        return rows;
    }

    private List<BackOfficeOverviewTopProductDto> buildTopProducts() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime pivot = now.minusDays(7);
        LocalDateTime from = now.minusDays(14);

        List<OrderArticleRepository.ProductRevenueSplitView> topRows = orderArticleRepository
                .aggregateRevenueSplitByArticleFrom(from, pivot)
                .stream()
                .sorted(Comparator.comparing(
                        row -> BigDecimal.valueOf(row.getCurrentRevenue() == null ? 0d : row.getCurrentRevenue()),
                        Comparator.reverseOrder()
                ))
                .limit(3)
                .toList();

        List<Long> articleIds = topRows.stream()
                .map(OrderArticleRepository.ProductRevenueSplitView::getArticleId)
                .filter(Objects::nonNull)
                .toList();
        Map<Long, Article> articleById = new HashMap<>();
        if (!articleIds.isEmpty()) {
            for (Article article : articleRepository.findByIdIn(articleIds)) {
                articleById.put(article.getId(), article);
            }
        }

        return topRows.stream()
                .map(row -> {
                    Article article = articleById.get(row.getArticleId());
                    String category = article != null && article.getCategories() != null && !article.getCategories().isEmpty()
                            ? article.getCategories().get(0).getName()
                            : "-";
                    BigDecimal current = BigDecimal.valueOf(row.getCurrentRevenue() == null ? 0d : row.getCurrentRevenue());
                    BigDecimal previous = BigDecimal.valueOf(row.getPreviousRevenue() == null ? 0d : row.getPreviousRevenue());
                    return BackOfficeOverviewTopProductDto.builder()
                            .name(article == null ? null : article.getName())
                            .category(category)
                            .revenue(current == null ? 0d : current.doubleValue())
                            .delta(formatDelta(current, previous))
                            .build();
                })
                .toList();
    }

    private List<BackOfficeOverviewTeamActivityItemDto> buildTeamActivity() {
        List<SecurityActivityEntity> events = securityActivityRepository.findAllByOrderByEventAtDesc(PageRequest.of(0, 6)).getContent();
        Map<String, String> rolesByUser = resolveRolesByUser(events);
        List<BackOfficeOverviewTeamActivityItemDto> rows = new ArrayList<>();

        for (SecurityActivityEntity event : events) {
            String userId = event.getUserId() == null ? "-" : event.getUserId();
            rows.add(BackOfficeOverviewTeamActivityItemDto.builder()
                    .name(userId)
                    .role(rolesByUser.getOrDefault(userId, "ADMIN"))
                    .action(event.getAction())
                    .time(toRelativeTime(event.getEventAt()))
                    .build());
        }
        return rows;
    }

    private BackOfficeOverviewTeamProductivityDto buildTeamProductivity() {
        List<SecurityActivityEntity> events = securityActivityRepository.findAllByOrderByEventAtDesc(PageRequest.of(0, 100)).getContent();

        Map<String, Long> tasksByActor = new HashMap<>();
        Map<String, Long> errorsByActor = new HashMap<>();
        Map<String, LocalDateTime> lastActiveByActor = new HashMap<>();

        for (SecurityActivityEntity event : events) {
            String actor = event.getUserId() == null ? "-" : event.getUserId();
            tasksByActor.merge(actor, 1L, Long::sum);
            if (!"SUCCESS".equalsIgnoreCase(event.getStatus())) {
                errorsByActor.merge(actor, 1L, Long::sum);
            }
            if (event.getEventAt() != null) {
                lastActiveByActor.merge(actor, event.getEventAt(), (a, b) -> a.isAfter(b) ? a : b);
            }
        }

        Map<String, String> rolesByUser = resolveRolesByUser(events);
        List<BackOfficeOverviewTeamMemberPerformanceDto> performances = new ArrayList<>();
        for (Map.Entry<String, Long> entry : tasksByActor.entrySet()) {
            String actor = entry.getKey();
            long tasks = entry.getValue();
            long errors = errorsByActor.getOrDefault(actor, 0L);
            double successRate = tasks == 0 ? 0d : ((tasks - errors) * 100.0d) / tasks;

            performances.add(BackOfficeOverviewTeamMemberPerformanceDto.builder()
                    .actor(actor)
                    .name(actor)
                    .role(rolesByUser.getOrDefault(actor, "ADMIN"))
                    .tasksCompleted(tasks)
                    .errors(errors)
                    .successRate(successRate)
                    .lastActiveAt(lastActiveByActor.get(actor))
                    .build());
        }

        performances.sort(Comparator.comparing(BackOfficeOverviewTeamMemberPerformanceDto::getTasksCompleted).reversed());

        String topPerformer = performances.isEmpty() ? null : performances.get(0).getName();
        long tasksCompleted = tasksByActor.values().stream().mapToLong(Long::longValue).sum();
        long errors = errorsByActor.values().stream().mapToLong(Long::longValue).sum();

        return BackOfficeOverviewTeamProductivityDto.builder()
                .tasksCompleted(tasksCompleted)
                .errors(errors)
                .activeMembers((long) tasksByActor.size())
                .topPerformer(topPerformer)
                .performances(performances)
                .build();
    }

    private String toRelativeTime(LocalDateTime time) {
        if (time == null) {
            return "-";
        }

        long minutes = ChronoUnit.MINUTES.between(time, LocalDateTime.now());
        if (minutes < 1) {
            return "now";
        }
        if (minutes < 60) {
            return minutes + "m";
        }
        long hours = minutes / 60;
        if (hours < 24) {
            return hours + "h";
        }
        long days = hours / 24;
        return days + "d";
    }

    private String formatDelta(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            if (current == null || current.compareTo(BigDecimal.ZERO) == 0) {
                return "+0%";
            }
            return "+100%";
        }
        BigDecimal delta = current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
        int pct = delta.setScale(0, RoundingMode.HALF_UP).intValue();
        return (pct >= 0 ? "+" : "") + pct + "%";
    }

    private Map<String, String> resolveRolesByUser(List<SecurityActivityEntity> events) {
        Map<String, String> rolesByUser = new HashMap<>();
        List<String> userIds = events.stream()
                .map(SecurityActivityEntity::getUserId)
                .filter(Objects::nonNull)
                .filter(id -> !id.isBlank())
                .distinct()
                .toList();

        if (userIds.isEmpty()) {
            return rolesByUser;
        }

        List<Authentication> authentications = authenticationRepository.findAllById(userIds);
        for (Authentication authentication : authentications) {
            if (authentication == null || authentication.getUserId() == null) {
                continue;
            }
            rolesByUser.put(authentication.getUserId(), mapPrimaryRole(authentication.getRoles()));
        }
        return rolesByUser;
    }

    private String mapPrimaryRole(List<UserRole> roles) {
        if (roles == null || roles.isEmpty()) return "ADMIN";
        if (roles.contains(UserRole.SUPER_ADMIN)) return "SUPER_ADMIN";
        if (roles.contains(UserRole.ADMIN)) return "ADMIN";
        if (roles.contains(UserRole.LIVREUR)) return "LIVREUR";
        if (roles.contains(UserRole.PARTNER)) return "PARTENAIRE";
        if (roles.contains(UserRole.CUSTOMER)) return "CLIENT";
        return "ADMIN";
    }
}
