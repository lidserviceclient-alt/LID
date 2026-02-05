package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.CreateBackofficeOrderRequest;
import com.lifeevent.lid.core.dto.CreateOrderLineRequest;
import com.lifeevent.lid.core.dto.OrderQuoteRequest;
import com.lifeevent.lid.core.dto.OrderQuoteResponse;
import com.lifeevent.lid.core.dto.OrderSummaryDto;
import com.lifeevent.lid.core.entity.CodePromo;
import com.lifeevent.lid.core.entity.CodePromoUtilisation;
import com.lifeevent.lid.core.entity.Commande;
import com.lifeevent.lid.core.entity.CommandeLigne;
import com.lifeevent.lid.core.entity.Produit;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.enums.CibleCodePromo;
import com.lifeevent.lid.core.enums.StatutCommande;
import com.lifeevent.lid.core.enums.StatutLivraison;
import com.lifeevent.lid.core.repository.CodePromoRepository;
import com.lifeevent.lid.core.repository.CodePromoUtilisationRepository;
import com.lifeevent.lid.core.repository.CommandeLigneRepository;
import com.lifeevent.lid.core.repository.CommandeRepository;
import com.lifeevent.lid.core.repository.LivraisonRepository;
import com.lifeevent.lid.core.repository.ProduitRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final CommandeRepository commandeRepository;
    private final CommandeLigneRepository commandeLigneRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ProduitRepository produitRepository;
    private final LivraisonRepository livraisonRepository;
    private final CodePromoRepository codePromoRepository;
    private final CodePromoUtilisationRepository codePromoUtilisationRepository;
    private final LoyaltyService loyaltyService;

    public OrderService(CommandeRepository commandeRepository,
                        CommandeLigneRepository commandeLigneRepository,
                        UtilisateurRepository utilisateurRepository,
                        ProduitRepository produitRepository,
                        LivraisonRepository livraisonRepository,
                        CodePromoRepository codePromoRepository,
                        CodePromoUtilisationRepository codePromoUtilisationRepository,
                        LoyaltyService loyaltyService) {
        this.commandeRepository = commandeRepository;
        this.commandeLigneRepository = commandeLigneRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.produitRepository = produitRepository;
        this.livraisonRepository = livraisonRepository;
        this.codePromoRepository = codePromoRepository;
        this.codePromoUtilisationRepository = codePromoUtilisationRepository;
        this.loyaltyService = loyaltyService;
    }

    public Page<OrderSummaryDto> listOrders(StatutCommande statut, String q, Pageable pageable) {
        Page<Commande> page = commandeRepository.search(statut, q, pageable);

        return page.map(this::toSummary);
    }

    public List<OrderSummaryDto> recentOrders() {
        return commandeRepository.findTop5ByOrderByDateCreationDesc()
            .stream()
            .map(this::toSummary)
            .collect(Collectors.toList());
    }

    @Transactional
    public OrderSummaryDto createBackofficeOrder(CreateBackofficeOrderRequest request) {
        if (request == null) throw new RuntimeException("Requête invalide");
        Utilisateur customer = utilisateurRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Client introuvable"));

        Commande commande = new Commande();
        commande.setClient(customer);
        commande.setStatut(StatutCommande.CREEE);
        commande.setMontantTotal(BigDecimal.ZERO);
        commande = commandeRepository.save(commande);

        BigDecimal subTotal = BigDecimal.ZERO;
        String boutiqueId = null;
        boolean mixedBoutiques = false;
        for (CreateOrderLineRequest line : request.getLines()) {
            if (line == null || line.getQuantity() == null || line.getQuantity() <= 0) {
                continue;
            }

            Produit produit = null;
            BigDecimal unitPrice = line.getUnitPrice();

            if (line.getProductId() != null && !line.getProductId().isBlank()) {
                produit = produitRepository.findById(line.getProductId()).orElse(null);
                if (produit != null) {
                    unitPrice = produit.getPrix();
                }
            }

            if (unitPrice == null) {
                throw new RuntimeException("Prix unitaire requis (ou produit valide)");
            }

            CommandeLigne commandeLigne = new CommandeLigne();
            commandeLigne.setCommande(commande);
            commandeLigne.setProduit(produit);
            commandeLigne.setQuantite(line.getQuantity());
            commandeLigne.setPrixUnitaire(unitPrice);
            commandeLigneRepository.save(commandeLigne);

            subTotal = subTotal.add(unitPrice.multiply(BigDecimal.valueOf(line.getQuantity())));

            if (produit != null && produit.getBoutique() != null) {
                String currentBoutiqueId = produit.getBoutique().getId();
                if (boutiqueId == null) {
                    boutiqueId = currentBoutiqueId;
                } else if (currentBoutiqueId != null && !boutiqueId.equals(currentBoutiqueId)) {
                    mixedBoutiques = true;
                }
            }
        }

        if (subTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Aucune ligne valide");
        }

        PromoApplication promo = applyPromoCode(customer, request.getPromoCode(), subTotal, mixedBoutiques ? null : boutiqueId);
        BigDecimal total = subTotal.subtract(promo.discountAmount());
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;

        commande.setMontantTotal(total);
        commandeRepository.save(commande);

        if (promo.applied() && promo.promo() != null && promo.discountAmount().compareTo(BigDecimal.ZERO) > 0) {
            CodePromoUtilisation utilisation = new CodePromoUtilisation();
            utilisation.setCodePromo(promo.promo());
            utilisation.setUtilisateur(customer);
            utilisation.setCommande(commande);
            utilisation.setMontantReduction(promo.discountAmount());
            codePromoUtilisationRepository.save(utilisation);
        }

        return toSummary(commande);
    }

    @Transactional(readOnly = true)
    public OrderQuoteResponse quote(OrderQuoteRequest request) {
        if (request == null) throw new RuntimeException("Requête invalide");
        Utilisateur customer = utilisateurRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Client introuvable"));

        BigDecimal subTotal = BigDecimal.ZERO;
        String boutiqueId = null;
        boolean mixedBoutiques = false;

        for (CreateOrderLineRequest line : request.getLines()) {
            if (line == null || line.getQuantity() == null || line.getQuantity() <= 0) continue;
            Produit produit = null;
            BigDecimal unitPrice = line.getUnitPrice();
            if (line.getProductId() != null && !line.getProductId().isBlank()) {
                produit = produitRepository.findById(line.getProductId()).orElse(null);
                if (produit != null) unitPrice = produit.getPrix();
            }
            if (unitPrice == null) continue;
            subTotal = subTotal.add(unitPrice.multiply(BigDecimal.valueOf(line.getQuantity())));
            if (produit != null && produit.getBoutique() != null) {
                String currentBoutiqueId = produit.getBoutique().getId();
                if (boutiqueId == null) boutiqueId = currentBoutiqueId;
                else if (currentBoutiqueId != null && !boutiqueId.equals(currentBoutiqueId)) mixedBoutiques = true;
            }
        }

        PromoApplication promo = applyPromoCode(customer, request.getPromoCode(), subTotal, mixedBoutiques ? null : boutiqueId);
        BigDecimal total = subTotal.subtract(promo.discountAmount());
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;

        return new OrderQuoteResponse(
                subTotal,
                promo.discountAmount(),
                total,
                promo.applied(),
                promo.code(),
                promo.message()
        );
    }

    @Transactional
    public OrderSummaryDto updateStatus(String orderId, StatutCommande status) {
        if (orderId == null || orderId.isBlank()) throw new RuntimeException("Commande introuvable");
        if (status == null) throw new RuntimeException("Statut invalide");

        Commande commande = commandeRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));
        commande.setStatut(status);
        commande = commandeRepository.save(commande);

        if (status == StatutCommande.EXPEDIEE) {
            var livraison = livraisonRepository.findByCommande(commande).orElse(null);
            if (livraison == null) {
                livraison = new com.lifeevent.lid.core.entity.Livraison();
                livraison.setCommande(commande);
            }
            if (livraison.getNumeroSuivi() == null || livraison.getNumeroSuivi().isBlank()) {
                String suffix = commande.getId();
                if (suffix.length() > 8) suffix = suffix.substring(suffix.length() - 8);
                livraison.setNumeroSuivi("TRK-" + suffix.toUpperCase());
            }
            if (livraison.getTransporteur() == null || livraison.getTransporteur().isBlank()) {
                livraison.setTransporteur("Transporteur");
            }
            livraison.setStatut(StatutLivraison.EN_COURS);
            if (livraison.getDateLivraisonEstimee() == null) {
                livraison.setDateLivraisonEstimee(java.time.LocalDate.now().plusDays(2));
            }
            livraison.setDateLivraison(null);
            livraisonRepository.save(livraison);
        }

        if (status == StatutCommande.LIVREE) {
            var livraison = livraisonRepository.findByCommande(commande).orElse(null);
            if (livraison == null) {
                livraison = new com.lifeevent.lid.core.entity.Livraison();
                livraison.setCommande(commande);
            }
            livraison.setStatut(StatutLivraison.LIVREE);
            if (livraison.getDateLivraison() == null) {
                livraison.setDateLivraison(LocalDateTime.now());
            }
            livraisonRepository.save(livraison);

            loyaltyService.applyPointsForDeliveredOrder(commande);
        }

        return toSummary(commande);
    }

    private record PromoApplication(boolean applied, String code, BigDecimal discountAmount, String message, CodePromo promo) {
    }

    private PromoApplication applyPromoCode(Utilisateur customer, String promoCode, BigDecimal subTotal, String boutiqueId) {
        String code = promoCode != null ? promoCode.trim() : "";
        if (code.isBlank()) {
            return new PromoApplication(false, null, BigDecimal.ZERO, null, null);
        }
        code = code.toUpperCase(java.util.Locale.ROOT);

        CodePromo promo = codePromoRepository.findByCodeIgnoreCase(code).orElse(null);
        if (promo == null) {
            return new PromoApplication(false, code, BigDecimal.ZERO, "Code promo introuvable", null);
        }
        if (promo.getEstActif() == null || !promo.getEstActif()) {
            return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Code promo inactif", null);
        }

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (promo.getDateDebut() != null && now.isBefore(promo.getDateDebut())) {
            return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Code promo pas encore actif", null);
        }
        if (promo.getDateFin() != null && now.isAfter(promo.getDateFin())) {
            return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Code promo expiré", null);
        }

        if (promo.getMontantMinCommande() != null && subTotal.compareTo(promo.getMontantMinCommande()) < 0) {
            return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Montant minimum non atteint", null);
        }

        if (promo.getUsageMax() != null && promo.getUsageMax() > 0) {
            long used = codePromoUtilisationRepository.countByCodePromoId(promo.getId());
            if (used >= promo.getUsageMax()) {
                return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Code promo épuisé", null);
            }
        }

        int perUserMax = promo.getUsageMaxParUtilisateur() != null ? promo.getUsageMaxParUtilisateur() : 1;
        if (perUserMax > 0) {
            long usedByUser = codePromoUtilisationRepository.countByCodePromoIdAndUtilisateurId(promo.getId(), customer.getId());
            if (usedByUser >= perUserMax) {
                return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Limite d’utilisation atteinte pour ce client", null);
            }
        }

        CibleCodePromo cible = promo.getCible() != null ? promo.getCible() : CibleCodePromo.GLOBAL;
        if (cible == CibleCodePromo.UTILISATEUR) {
            if (promo.getUtilisateur() == null || !promo.getUtilisateur().getId().equals(customer.getId())) {
                return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Code promo non applicable à ce client", null);
            }
        }
        if (cible == CibleCodePromo.BOUTIQUE) {
            if (promo.getBoutique() == null || boutiqueId == null || !promo.getBoutique().getId().equals(boutiqueId)) {
                return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Code promo non applicable à cette boutique", null);
            }
        }

        BigDecimal percent = promo.getPourcentage() != null ? promo.getPourcentage() : BigDecimal.ZERO;
        BigDecimal discount = subTotal.multiply(percent).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        if (discount.compareTo(BigDecimal.ZERO) <= 0) {
            return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Réduction nulle", null);
        }
        if (discount.compareTo(subTotal) > 0) discount = subTotal;

        return new PromoApplication(true, promo.getCode(), discount, "Code promo appliqué", promo);
    }

    private OrderSummaryDto toSummary(Commande commande) {
        Utilisateur client = commande.getClient();
        String name = client != null
            ? String.format("%s %s", nullToEmpty(client.getPrenom()), nullToEmpty(client.getNom())).trim()
            : "-";

        int items = (int) commandeLigneRepository.countByCommandeId(commande.getId());

        return new OrderSummaryDto(
            commande.getId(),
            name.isBlank() ? "-" : name,
            items,
            commande.getMontantTotal(),
            commande.getStatut() != null ? commande.getStatut().name() : "-",
            commande.getDateCreation()
        );
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
