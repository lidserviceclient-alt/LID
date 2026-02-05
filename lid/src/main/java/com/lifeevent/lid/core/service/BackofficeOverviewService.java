package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.BackofficeOverviewDto;
import com.lifeevent.lid.core.dto.LowStockItemDto;
import com.lifeevent.lid.core.dto.OrderPipelineStepDto;
import com.lifeevent.lid.core.dto.OrderSummaryDto;
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
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    public BackofficeOverviewService(
            DashboardService dashboardService,
            OrderService orderService,
            CommandeRepository commandeRepository,
            CommandeLigneRepository commandeLigneRepository,
            StockRepository stockRepository,
            CodePromoUtilisationRepository promoUtilisationRepository
    ) {
        this.dashboardService = dashboardService;
        this.orderService = orderService;
        this.commandeRepository = commandeRepository;
        this.commandeLigneRepository = commandeLigneRepository;
        this.stockRepository = stockRepository;
        this.promoUtilisationRepository = promoUtilisationRepository;
    }

    public BackofficeOverviewDto getOverview() {
        return getOverview(null);
    }

    public BackofficeOverviewDto getOverview(Integer seriesDays) {
        int days = normalizeSeriesDays(seriesDays);
        List<OrderSummaryDto> recentOrders = orderService.recentOrders();

        return new BackofficeOverviewDto(
                dashboardService.getDashboard(),
                recentOrders,
                buildOrderPipeline(),
                buildAnalyticsSeries(days),
                buildPromoUsageSeries(days),
                buildLowStock(DEFAULT_LOW_STOCK_THRESHOLD),
                buildTopProducts(DEFAULT_TOP_PRODUCTS)
        );
    }

    private static int normalizeSeriesDays(Integer days) {
        if (days == null) return DEFAULT_SERIES_DAYS;
        int safe = Math.max(1, days);
        return Math.min(safe, MAX_SERIES_DAYS);
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
        Map<LocalDate, Integer> countsByDay = new HashMap<>();

        for (Commande commande : commandes) {
            if (commande.getDateCreation() == null) continue;
            LocalDate date = commande.getDateCreation().toLocalDate();
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
            Produit produit = stock.getProduit();
            if (produit == null) continue;
            String supplier = produit.getMarque();
            if (supplier == null || supplier.isBlank()) {
                supplier = produit.getBoutique() != null ? produit.getBoutique().getNom() : "-";
            }

            items.add(new LowStockItemDto(
                    produit.getNom(),
                    produit.getReferencePartenaire(),
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
            Produit produit = ligne.getProduit();
            if (produit == null) continue;
            if (ligne.getQuantite() == null || ligne.getPrixUnitaire() == null) continue;

            BigDecimal lineTotal = ligne.getPrixUnitaire().multiply(BigDecimal.valueOf(ligne.getQuantite()));
            if (lineTotal.compareTo(BigDecimal.ZERO) <= 0) continue;

            ProductRevenue revenue = revenues.computeIfAbsent(produit.getId(), id -> new ProductRevenue(produit));
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
            String category = produit.getCategorie() != null ? produit.getCategorie().getNom() : "-";
            return new TopProductDto(
                    produit.getNom(),
                    category,
                    current,
                    formatDelta(current, previous)
            );
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
}
