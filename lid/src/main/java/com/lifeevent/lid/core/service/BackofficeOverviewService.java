package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.BackofficeOverviewDto;
import com.lifeevent.lid.core.dto.BackofficeActivityDto;
import com.lifeevent.lid.core.dto.LowStockItemDto;
import com.lifeevent.lid.core.dto.OrderPipelineStepDto;
import com.lifeevent.lid.core.dto.OrderSummaryDto;
import com.lifeevent.lid.core.dto.TeamActivityItemDto;
import com.lifeevent.lid.core.dto.TeamMemberPerformanceDto;
import com.lifeevent.lid.core.dto.TeamProductivityDto;
import com.lifeevent.lid.core.dto.TopProductDto;
import com.lifeevent.lid.core.entity.Commande;
import com.lifeevent.lid.core.entity.CommandeLigne;
import com.lifeevent.lid.core.entity.CodePromoUtilisation;
import com.lifeevent.lid.core.entity.Produit;
import com.lifeevent.lid.core.entity.Stock;
import com.lifeevent.lid.core.enums.StatutCommande;
import com.lifeevent.lid.core.repository.CodePromoUtilisationRepository;
import com.lifeevent.lid.core.repository.CommandeLigneRepository;
import com.lifeevent.lid.core.repository.CommandeRepository;
import com.lifeevent.lid.core.repository.StockRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import com.lifeevent.lid.order.repository.OrderRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Supplier;

@Service
public class BackofficeOverviewService {

    private static final int DEFAULT_LOW_STOCK_THRESHOLD = 10;
    private static final int DEFAULT_SERIES_DAYS = 12;
    private static final int MAX_SERIES_DAYS = 365;
    private static final int DEFAULT_TOP_PRODUCTS = 3;

    private final DashboardService dashboardService;
    private final OrderService orderService;
    private final CommandeRepository commandeRepository;
    private final CommandeLigneRepository commandeLigneRepository;
    private final StockRepository stockRepository;
    private final CodePromoUtilisationRepository promoUtilisationRepository;
    private final BackofficeActivityService backofficeActivityService;
    private final UtilisateurRepository utilisateurRepository;
    private final OrderRepository orderRepository;

    public BackofficeOverviewService(
            DashboardService dashboardService,
            OrderService orderService,
            CommandeRepository commandeRepository,
            CommandeLigneRepository commandeLigneRepository,
            StockRepository stockRepository,
            CodePromoUtilisationRepository promoUtilisationRepository,
            BackofficeActivityService backofficeActivityService,
            UtilisateurRepository utilisateurRepository,
            OrderRepository orderRepository
    ) {
        this.dashboardService = dashboardService;
        this.orderService = orderService;
        this.commandeRepository = commandeRepository;
        this.commandeLigneRepository = commandeLigneRepository;
        this.stockRepository = stockRepository;
        this.promoUtilisationRepository = promoUtilisationRepository;
        this.backofficeActivityService = backofficeActivityService;
        this.utilisateurRepository = utilisateurRepository;
        this.orderRepository = orderRepository;
    }

    public BackofficeOverviewDto getOverview() {
        return getOverview(null);
    }

    public BackofficeOverviewDto getOverview(Integer seriesDays) {
        int days = normalizeSeriesDays(seriesDays);
        List<OrderSummaryDto> recentOrders = safeList(orderService::recentOrders);
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        TeamBundle teamBundle = safeValue(
                () -> buildTeamBundle(since),
                new TeamBundle(List.of(), new TeamProductivityDto(0, 0, 0, null, List.of()))
        );

        return new BackofficeOverviewDto(
                safeValue(dashboardService::getDashboard, null),
                recentOrders,
                safeList(this::buildOrderPipeline),
                safeList(() -> buildAnalyticsSeries(days)),
                safeList(() -> buildPromoUsageSeries(days)),
                safeList(() -> buildLowStock(DEFAULT_LOW_STOCK_THRESHOLD)),
                safeList(() -> buildTopProducts(DEFAULT_TOP_PRODUCTS)),
                teamBundle.activity(),
                teamBundle.productivity()
        );
    }

    private static int normalizeSeriesDays(Integer days) {
        if (days == null) return DEFAULT_SERIES_DAYS;
        int safe = Math.max(1, days);
        return Math.min(safe, MAX_SERIES_DAYS);
    }

    private static <T> T safeValue(Supplier<T> supplier, T fallback) {
        try {
            return supplier.get();
        } catch (Exception ex) {
            return fallback;
        }
    }

    private static <T> List<T> safeList(Supplier<List<T>> supplier) {
        try {
            List<T> value = supplier.get();
            return value == null ? List.of() : value;
        } catch (Exception ex) {
            return List.of();
        }
    }

    private List<OrderPipelineStepDto> buildOrderPipeline() {
        long nouvelles = commandeRepository.countByStatut(StatutCommande.CREEE);
        long preparation = commandeRepository.countByStatut(StatutCommande.PAYEE);
        long expediees = commandeRepository.countByStatut(StatutCommande.EXPEDIEE);
        long retours = commandeRepository.countByStatut(StatutCommande.REMBOURSEE)
                + commandeRepository.countByStatut(StatutCommande.ANNULEE);

        return List.of(
                new OrderPipelineStepDto("Nouvelles", nouvelles),
                new OrderPipelineStepDto("En preparation", preparation),
                new OrderPipelineStepDto("Expediees", expediees),
                new OrderPipelineStepDto("Retours", retours)
        );
    }

    private List<Integer> buildAnalyticsSeries(int days) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(days - 1L);
        LocalDateTime from = LocalDateTime.of(start, LocalTime.MIN);

        List<Commande> commandes = commandeRepository.findByDateCreationAfter(from);
        List<com.lifeevent.lid.order.entity.Order> shopOrders = orderRepository.findByCreatedAtAfter(from);
        Map<LocalDate, Integer> countsByDay = new HashMap<>();

        for (Commande commande : commandes) {
            if (commande.getDateCreation() == null) continue;
            LocalDate date = commande.getDateCreation().toLocalDate();
            countsByDay.merge(date, 1, Integer::sum);
        }
        for (com.lifeevent.lid.order.entity.Order order : shopOrders) {
            if (order == null || order.getCreatedAt() == null) continue;
            LocalDate date = order.getCreatedAt().toLocalDate();
            countsByDay.merge(date, 1, Integer::sum);
        }

        List<Integer> series = new ArrayList<>(days);
        for (int i = 0; i < days; i++) {
            LocalDate day = start.plusDays(i);
            series.add(countsByDay.getOrDefault(day, 0));
        }
        return series;
    }

    private List<Integer> buildPromoUsageSeries(int days) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(days - 1L);
        LocalDateTime from = LocalDateTime.of(start, LocalTime.MIN);

        List<CodePromoUtilisation> utilisations = promoUtilisationRepository.findByDateUtilisationAfter(from);
        Map<LocalDate, Integer> countsByDay = new HashMap<>();

        for (CodePromoUtilisation utilisation : utilisations) {
            if (utilisation.getDateUtilisation() == null) continue;
            LocalDate date = utilisation.getDateUtilisation().toLocalDate();
            countsByDay.merge(date, 1, Integer::sum);
        }

        List<Integer> series = new ArrayList<>(days);
        for (int i = 0; i < days; i++) {
            LocalDate day = start.plusDays(i);
            series.add(countsByDay.getOrDefault(day, 0));
        }
        return series;
    }

    private List<LowStockItemDto> buildLowStock(int threshold) {
        List<Stock> stocks = stockRepository
                .findTop5ByQuantiteDisponibleLessThanOrderByQuantiteDisponibleAsc(threshold);

        List<LowStockItemDto> items = new ArrayList<>(stocks.size());
        for (Stock stock : stocks) {
            Produit produit;
            try {
                produit = stock.getProduit();
            } catch (Exception ex) {
                continue;
            }
            if (produit == null) continue;
            String name;
            String sku;
            String supplier;
            try {
                name = produit.getNom();
                sku = produit.getReferencePartenaire();
                supplier = produit.getMarque();
                if (supplier == null || supplier.isBlank()) {
                    supplier = produit.getBoutique() != null ? produit.getBoutique().getNom() : "-";
                }
            } catch (Exception ex) {
                continue;
            }

            items.add(new LowStockItemDto(
                    name,
                    sku,
                    stock.getQuantiteDisponible() != null ? stock.getQuantiteDisponible() : 0,
                    threshold,
                    supplier
            ));
        }
        return items;
    }

    private List<TopProductDto> buildTopProducts(int limit) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime from = now.minusDays(14);
        LocalDateTime pivot = now.minusDays(7);

        List<CommandeLigne> lignes = commandeLigneRepository.findByCommandeDateCreationAfter(from);
        Map<String, ProductRevenue> revenues = new HashMap<>();

        for (CommandeLigne ligne : lignes) {
            if (ligne.getCommande() == null || ligne.getCommande().getDateCreation() == null) continue;
            Produit produit;
            try {
                produit = ligne.getProduit();
            } catch (Exception ex) {
                continue;
            }
            if (produit == null) continue;
            if (ligne.getQuantite() == null || ligne.getPrixUnitaire() == null) continue;

            BigDecimal lineTotal = ligne.getPrixUnitaire().multiply(BigDecimal.valueOf(ligne.getQuantite()));
            if (lineTotal.compareTo(BigDecimal.ZERO) <= 0) continue;

            String productId;
            try {
                productId = produit.getId();
            } catch (Exception ex) {
                continue;
            }
            if (productId == null || productId.isBlank()) continue;
            ProductRevenue revenue = revenues.computeIfAbsent(productId, id -> new ProductRevenue(produit));
            if (ligne.getCommande().getDateCreation().isAfter(pivot)) {
                revenue.current = revenue.current.add(lineTotal);
            } else {
                revenue.previous = revenue.previous.add(lineTotal);
            }
        }

        return revenues.values().stream()
                .sorted((a, b) -> b.current.compareTo(a.current))
                .limit(limit)
                .map(ProductRevenue::toDto)
                .toList();
    }

    private static final class ProductRevenue {
        private final Produit produit;
        private BigDecimal current = BigDecimal.ZERO;
        private BigDecimal previous = BigDecimal.ZERO;

        private ProductRevenue(Produit produit) {
            this.produit = produit;
        }

        private TopProductDto toDto() {
            try {
                String category = produit.getCategorie() != null ? produit.getCategorie().getNom() : "-";
                return new TopProductDto(
                        produit.getNom(),
                        category,
                        current,
                        formatDelta(current, previous)
                );
            } catch (Exception ex) {
                return new TopProductDto("-", "-", current, formatDelta(current, previous));
            }
        }
    }

    private static String formatDelta(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            if (current == null || current.compareTo(BigDecimal.ZERO) == 0) return "+0%";
            return "+100%";
        }

        BigDecimal delta = current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        int pct = delta.setScale(0, RoundingMode.HALF_UP).intValue();
        return (pct >= 0 ? "+" : "") + pct + "%";
    }

    private TeamBundle buildTeamBundle(LocalDateTime since) {
        List<BackofficeActivityDto> recent = backofficeActivityService
                .list(since, PageRequest.of(0, 50))
                .getContent();

        List<TeamActivityItemDto> items = recent.stream()
                .filter(Objects::nonNull)
                .map((a) -> new TeamActivityItemDto(
                        resolveDisplayName(a.actor()),
                        resolveRoleLabel(a.actor()),
                        resolveAction(a),
                        toRelativeTime(a.createdAt())
                ))
                .toList();

        Map<String, MemberAgg> byActor = new HashMap<>();
        for (BackofficeActivityDto a : recent) {
            if (a == null) continue;
            String actor = a.actor();
            if (actor == null || actor.isBlank()) actor = "system";
            MemberAgg agg = byActor.computeIfAbsent(actor, k -> new MemberAgg());
            agg.tasks++;
            if (a.status() != null && a.status() >= 400) {
                agg.errors++;
            }
            if (agg.lastActiveAt == null || (a.createdAt() != null && a.createdAt().isAfter(agg.lastActiveAt))) {
                agg.lastActiveAt = a.createdAt();
            }
        }

        List<TeamMemberPerformanceDto> performances = byActor.entrySet().stream()
                .map((e) -> {
                    String actor = e.getKey();
                    MemberAgg agg = e.getValue();
                    long tasks = agg == null ? 0 : agg.tasks;
                    long errors = agg == null ? 0 : agg.errors;
                    double success = tasks <= 0 ? 1.0 : (double) Math.max(tasks - errors, 0) / (double) tasks;
                    return new TeamMemberPerformanceDto(
                            actor,
                            resolveDisplayName(actor),
                            resolveRoleLabel(actor),
                            tasks,
                            errors,
                            success,
                            agg == null ? null : agg.lastActiveAt
                    );
                })
                .sorted((a, b) -> Long.compare(b.tasksCompleted(), a.tasksCompleted()))
                .limit(10)
                .toList();

        long totalTasks = performances.stream().mapToLong(TeamMemberPerformanceDto::tasksCompleted).sum();
        long totalErrors = performances.stream().mapToLong(TeamMemberPerformanceDto::errors).sum();
        long activeMembers = performances.stream().filter((p) -> p.tasksCompleted() > 0).count();
        String top = performances.isEmpty() ? null : performances.get(0).name();

        TeamProductivityDto productivity = new TeamProductivityDto(
                totalTasks,
                totalErrors,
                activeMembers,
                top,
                performances
        );

        return new TeamBundle(items, productivity);
    }

    private String resolveDisplayName(String actor) {
        if (actor == null || actor.isBlank()) return "system";
        return utilisateurRepository.findByEmail(actor)
                .map((u) -> {
                    String name = (u.getPrenom() == null ? "" : u.getPrenom()) + " " + (u.getNom() == null ? "" : u.getNom());
                    String trimmed = name.trim();
                    return trimmed.isEmpty() ? actor : trimmed;
                })
                .orElse(actor);
    }

    private String resolveRoleLabel(String actor) {
        if (actor == null || actor.isBlank()) return "-";
        return utilisateurRepository.findByEmail(actor)
                .map((u) -> u.getRole() == null ? "-" : u.getRole().name())
                .orElse("-");
    }

    private static String resolveAction(BackofficeActivityDto a) {
        if (a == null) return "-";
        if (a.summary() != null && !a.summary().isBlank()) return a.summary();
        String path = a.path() == null ? "" : a.path();
        String method = a.method() == null ? "" : a.method();
        return (method + " " + path).trim();
    }

    private static String toRelativeTime(LocalDateTime t) {
        if (t == null) return "-";
        long minutes = t.until(LocalDateTime.now(), ChronoUnit.MINUTES);
        if (minutes < 1) return "À l’instant";
        if (minutes < 60) return "Il y a " + minutes + " min";
        long hours = minutes / 60;
        if (hours < 24) return "Il y a " + hours + " h";
        long days = hours / 24;
        return "Il y a " + days + " j";
    }

    private record TeamBundle(List<TeamActivityItemDto> activity, TeamProductivityDto productivity) {
    }

    private static final class MemberAgg {
        private long tasks = 0;
        private long errors = 0;
        private LocalDateTime lastActiveAt = null;
    }
}
