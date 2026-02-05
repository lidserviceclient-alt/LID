package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.LogisticsKpiDto;
import com.lifeevent.lid.core.dto.ShipmentSummaryDto;
import com.lifeevent.lid.core.dto.UpsertShipmentRequest;
import com.lifeevent.lid.core.entity.Commande;
import com.lifeevent.lid.core.entity.Livraison;
import com.lifeevent.lid.core.enums.StatutLivraison;
import com.lifeevent.lid.core.repository.CommandeRepository;
import com.lifeevent.lid.core.repository.LivraisonRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LogisticsService {

    private final LivraisonRepository livraisonRepository;
    private final CommandeRepository commandeRepository;

    public LogisticsService(LivraisonRepository livraisonRepository, CommandeRepository commandeRepository) {
        this.livraisonRepository = livraisonRepository;
        this.commandeRepository = commandeRepository;
    }

    @Transactional(readOnly = true)
    public Page<ShipmentSummaryDto> listShipments(StatutLivraison status, String carrier, String q, Pageable pageable) {
        return livraisonRepository.search(status, carrier, q, pageable).map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public LogisticsKpiDto kpis(int days) {
        int safeDays = Math.max(1, Math.min(days, 365));
        LocalDateTime from = LocalDateTime.now().minusDays(safeDays);

        long inTransit = livraisonRepository.countByStatut(StatutLivraison.EN_COURS);

        double avgDelay = computeAverageDelayDays(from);
        BigDecimal avgCost = livraisonRepository.avgCostFrom(from);

        return new LogisticsKpiDto(inTransit, avgDelay, avgCost);
    }

    @Transactional
    public ShipmentSummaryDto upsertShipment(UpsertShipmentRequest request) {
        if (request == null) throw new RuntimeException("Requête invalide");

        Commande commande = commandeRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));

        Livraison livraison = livraisonRepository.findByCommande(commande).orElse(null);
        if (livraison == null) {
            livraison = new Livraison();
            livraison.setCommande(commande);
        }

        livraison.setTransporteur(request.getCarrier());
        livraison.setNumeroSuivi(request.getTrackingId());
        livraison.setStatut(request.getStatus());
        livraison.setDateLivraisonEstimee(request.getEta());
        livraison.setCoutLivraison(request.getCost());

        if (request.getStatus() == StatutLivraison.LIVREE && livraison.getDateLivraison() == null) {
            livraison.setDateLivraison(LocalDateTime.now());
        }
        if (request.getStatus() != StatutLivraison.LIVREE) {
            livraison.setDateLivraison(null);
        }

        livraison = livraisonRepository.save(livraison);
        return toSummary(livraison);
    }

    private ShipmentSummaryDto toSummary(Livraison livraison) {
        Commande commande = livraison.getCommande();
        String orderId = commande != null ? commande.getId() : null;
        return new ShipmentSummaryDto(
                livraison.getId(),
                livraison.getNumeroSuivi(),
                orderId,
                livraison.getTransporteur(),
                livraison.getStatut(),
                livraison.getDateLivraisonEstimee(),
                livraison.getCoutLivraison()
        );
    }

    private double computeAverageDelayDays(LocalDateTime from) {
        List<Livraison> delivered = livraisonRepository.findByDateLivraisonAfter(from);
        if (delivered == null || delivered.isEmpty()) return 0.0;

        double sum = 0.0;
        int count = 0;
        for (Livraison l : delivered) {
            if (l.getDateLivraison() == null) continue;
            Commande c = l.getCommande();
            if (c == null || c.getDateCreation() == null) continue;
            long hours = Duration.between(c.getDateCreation(), l.getDateLivraison()).toHours();
            if (hours < 0) continue;
            sum += (hours / 24.0);
            count++;
        }
        if (count == 0) return 0.0;
        return BigDecimal.valueOf(sum / count).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}

