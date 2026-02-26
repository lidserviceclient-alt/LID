package com.lifeevent.lid.core.service;

import com.lifeevent.lid.auth.service.EmailService;
import com.lifeevent.lid.core.dto.LogisticsKpiDto;
import com.lifeevent.lid.core.dto.ScanShipmentRequest;
import com.lifeevent.lid.core.dto.ShipmentDetailDto;
import com.lifeevent.lid.core.dto.ShipmentItemDto;
import com.lifeevent.lid.core.dto.ShipmentSummaryDto;
import com.lifeevent.lid.core.dto.UpsertShipmentRequest;
import com.lifeevent.lid.core.dto.ConfirmDeliveryRequest;
import com.lifeevent.lid.core.entity.CustomerAddress;
import com.lifeevent.lid.core.entity.Commande;
import com.lifeevent.lid.core.entity.CommandeLigne;
import com.lifeevent.lid.core.entity.Livraison;
import com.lifeevent.lid.core.entity.Paiement;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.enums.StatutCommande;
import com.lifeevent.lid.core.enums.StatutPaiement;
import com.lifeevent.lid.core.enums.StatutLivraison;
import com.lifeevent.lid.core.repository.CommandeLigneRepository;
import com.lifeevent.lid.core.repository.CommandeRepository;
import com.lifeevent.lid.core.repository.CustomerAddressRepository;
import com.lifeevent.lid.core.repository.LivraisonRepository;
import com.lifeevent.lid.core.repository.PaiementRepository;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.StatusHistory;
import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.order.repository.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class LogisticsService {

    private final LivraisonRepository livraisonRepository;
    private final CommandeRepository commandeRepository;
    private final CommandeLigneRepository commandeLigneRepository;
    private final CustomerAddressRepository customerAddressRepository;
    private final PaiementRepository paiementRepository;
    private final OrderRepository orderRepository;
    private final LoyaltyService loyaltyService;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public LogisticsService(LivraisonRepository livraisonRepository,
                            CommandeRepository commandeRepository,
                            CommandeLigneRepository commandeLigneRepository,
                            CustomerAddressRepository customerAddressRepository,
                            PaiementRepository paiementRepository,
                            OrderRepository orderRepository,
                            LoyaltyService loyaltyService,
                            EmailService emailService) {
        this.livraisonRepository = livraisonRepository;
        this.commandeRepository = commandeRepository;
        this.commandeLigneRepository = commandeLigneRepository;
        this.customerAddressRepository = customerAddressRepository;
        this.paiementRepository = paiementRepository;
        this.orderRepository = orderRepository;
        this.loyaltyService = loyaltyService;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public Page<ShipmentSummaryDto> listShipments(StatutLivraison status, String carrier, String q, Pageable pageable) {
        return livraisonRepository.search(status, carrier, q, pageable).map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public ShipmentDetailDto getShipmentDetail(String shipmentId) {
        if (shipmentId == null || shipmentId.isBlank()) {
            throw new RuntimeException("Expedition introuvable");
        }

        Livraison livraison = livraisonRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Expedition introuvable"));

        Commande commande = livraison.getCommande();
        String orderId = commande != null ? commande.getId() : null;
        String currency = commande != null ? commande.getDevise() : null;
        BigDecimal orderTotal = commande != null ? commande.getMontantTotal() : null;

        Utilisateur customer = commande != null ? commande.getClient() : null;
        String customerName = customer != null
                ? String.format("%s %s", nullToEmpty(customer.getPrenom()), nullToEmpty(customer.getNom())).trim()
                : null;
        if (customerName != null && customerName.isBlank()) customerName = null;

        String customerEmail = customer != null ? trimToNull(customer.getEmail()) : null;
        String customerPhone = customer != null ? trimToNull(customer.getTelephone()) : null;
        String customerAddress = resolveCustomerAddress(customer);

        boolean paid = resolvePaidStatus(commande);

        List<ShipmentItemDto> items = resolveShipmentItems(commande);

        return new ShipmentDetailDto(
                livraison.getId(),
                livraison.getNumeroSuivi(),
                orderId,
                livraison.getTransporteur(),
                livraison.getStatut(),
                livraison.getDateLivraisonEstimee(),
                livraison.getCoutLivraison(),
                orderTotal,
                currency,
                paid,
                customerName,
                customerEmail,
                customerPhone,
                customerAddress,
                items,
                trimToNull(livraison.getLivreurReference()),
                trimToNull(livraison.getLivreurNom()),
                trimToNull(livraison.getLivreurTelephone()),
                trimToNull(livraison.getLivreurUtilisateur()),
                livraison.getDateScanLivreur()
        );
    }

    @Transactional
    public ShipmentSummaryDto updateShipmentStatus(String shipmentId, StatutLivraison status) {
        if (shipmentId == null || shipmentId.isBlank()) {
            throw new RuntimeException("Expedition introuvable");
        }
        if (status == null) {
            throw new RuntimeException("Statut requis");
        }

        Livraison livraison = livraisonRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Expedition introuvable"));

        livraison.setStatut(status);
        if (status == StatutLivraison.LIVREE && livraison.getDateLivraison() == null) {
            livraison.setDateLivraison(LocalDateTime.now());
        }
        if (status != StatutLivraison.LIVREE) {
            livraison.setDateLivraison(null);
        }

        livraison = livraisonRepository.save(livraison);
        syncLinkedOrderAndCommande(livraison);
        return toSummary(livraison);
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
        syncLinkedOrderAndCommande(livraison);
        return toSummary(livraison);
    }

    @Transactional
    public ShipmentDetailDto scanAndStartTransit(ScanShipmentRequest request, String scannedBy) {
        if (request == null || request.getQr() == null || request.getQr().isBlank()) {
            throw new RuntimeException("QR requis");
        }

        Livraison livraison = resolveShipmentFromQr(request.getQr());
        if (livraison == null) {
            throw new RuntimeException("Expedition introuvable");
        }
        if (livraison.getCommande() == null) {
            throw new RuntimeException("Commande introuvable");
        }

        Commande commande = livraison.getCommande();
        if (commande.getStatut() != StatutCommande.EXPEDIEE) {
            throw new RuntimeException("Commande non expédiée");
        }
        if (livraison.getStatut() == StatutLivraison.LIVREE) {
            throw new RuntimeException("Commande déjà livrée");
        }

        String courierReference = trimToNull(request.getCourierReference());
        String courierName = trimToNull(request.getCourierName());
        String courierPhone = trimToNull(request.getCourierPhone());
        String scannedBySafe = trimToNull(scannedBy);

        if (courierReference == null) {
            courierReference = scannedBySafe;
        }

        boolean alreadyInTransit = livraison.getStatut() == StatutLivraison.EN_COURS;
        livraison.setLivreurReference(courierReference);
        livraison.setLivreurNom(courierName);
        livraison.setLivreurTelephone(courierPhone);
        livraison.setLivreurUtilisateur(scannedBySafe);

        if (!alreadyInTransit) {
            livraison.setStatut(StatutLivraison.EN_COURS);
            livraison.setDateLivraison(null);
            livraison.setDateScanLivreur(LocalDateTime.now());
        } else if (livraison.getDateScanLivreur() == null) {
            livraison.setDateScanLivreur(LocalDateTime.now());
        }

        boolean codeGenerated = false;
        String code = trimToNull(livraison.getCodeRemise());
        if (code == null) {
            code = generate4DigitCode();
            livraison.setCodeRemise(code);
            livraison.setDateCodeRemise(LocalDateTime.now());
            codeGenerated = true;
        }

        livraison = livraisonRepository.save(livraison);
        syncLinkedOrderAndCommande(livraison);

        boolean shouldSendMail = (livraison.getDateMailExpedition() == null) || codeGenerated || !alreadyInTransit;
        String to = commande.getClient() != null ? trimToNull(commande.getClient().getEmail()) : null;
        if (shouldSendMail && to != null && emailService != null) {
            emailService.sendShippingDeliveryCode(to, commande.getId(), code);
            livraison.setDateMailExpedition(LocalDateTime.now());
            livraisonRepository.save(livraison);
        }

        return getShipmentDetail(livraison.getId());
    }

    @Transactional
    public ShipmentSummaryDto confirmDelivery(String shipmentId, ConfirmDeliveryRequest request) {
        if (shipmentId == null || shipmentId.isBlank()) {
            throw new RuntimeException("Expedition introuvable");
        }
        if (request == null || request.getCode() == null || request.getCode().isBlank()) {
            throw new RuntimeException("Code requis");
        }

        Livraison livraison = livraisonRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Expedition introuvable"));

        if (livraison.getStatut() != StatutLivraison.EN_COURS) {
            throw new RuntimeException("Livraison pas en transit");
        }

        String expected = trimToNull(livraison.getCodeRemise());
        String provided = trimToNull(request.getCode());
        if (expected == null || provided == null || !expected.equals(provided)) {
            throw new RuntimeException("Code invalide");
        }

        livraison.setStatut(StatutLivraison.LIVREE);
        if (livraison.getDateLivraison() == null) {
            livraison.setDateLivraison(LocalDateTime.now());
        }
        livraison = livraisonRepository.save(livraison);
        syncLinkedOrderAndCommande(livraison);
        return toSummary(livraison);
    }

    private void syncLinkedOrderAndCommande(Livraison livraison) {
        if (livraison == null) return;
        syncCoreCommandeStatusFromShipment(livraison);
        syncShopOrderStatusFromShipment(livraison);
    }

    private void syncCoreCommandeStatusFromShipment(Livraison livraison) {
        Commande commande = livraison.getCommande();
        if (commande == null) return;

        StatutLivraison shipmentStatus = livraison.getStatut();
        if (shipmentStatus == null) return;

        StatutCommande targetStatus = switch (shipmentStatus) {
            case EN_PREPARATION -> StatutCommande.PAYEE;
            case EN_COURS -> StatutCommande.EXPEDIEE;
            case LIVREE -> StatutCommande.LIVREE;
            case ECHEC -> StatutCommande.ANNULEE;
        };

        StatutCommande current = commande.getStatut();
        if (current == StatutCommande.REMBOURSEE) return;
        if (current == StatutCommande.LIVREE) return;

        if (current != null && rankCoreCommande(current) >= rankCoreCommande(targetStatus)) {
            if (targetStatus != StatutCommande.ANNULEE || current == StatutCommande.ANNULEE) {
                return;
            }
        }

        commande.setStatut(targetStatus);
        commandeRepository.save(commande);

        if (targetStatus == StatutCommande.LIVREE) {
            loyaltyService.applyPointsForDeliveredOrder(commande);
        }
    }

    private void syncShopOrderStatusFromShipment(Livraison livraison) {
        if (orderRepository == null) return;

        Commande commande = livraison.getCommande();
        String coreOrderId = commande != null ? trimToNull(commande.getId()) : null;
        Long shopOrderId = tryExtractShopOrderId(coreOrderId);
        if (shopOrderId == null) return;

        Order order = orderRepository.findById(shopOrderId).orElse(null);
        if (order == null) return;

        StatutLivraison shipmentStatus = livraison.getStatut();
        if (shipmentStatus == null) return;

        Status targetStatus = switch (shipmentStatus) {
            case EN_PREPARATION -> Status.PROCESSING;
            case EN_COURS -> Status.DELIVERY_IN_PROGRESS;
            case LIVREE -> Status.DELIVERED;
            case ECHEC -> Status.CANCELED;
        };

        Status current = order.getCurrentStatus();
        if (current == Status.DELIVERED || current == Status.CANCELED) return;

        String tracking = trimToNull(order.getTrackingNumber());
        String shipmentTracking = trimToNull(livraison.getNumeroSuivi());
        boolean trackingUpdated = false;
        if (tracking == null && shipmentTracking != null) {
            order.setTrackingNumber(shipmentTracking);
            trackingUpdated = true;
        }

        boolean statusChanged = false;
        if (targetStatus == Status.CANCELED) {
            if (current != Status.CANCELED) {
                appendShopOrderStatus(order, Status.CANCELED, "Livraison en échec");
                statusChanged = true;
            }
        } else if (current == null || rankShopOrder(targetStatus) > rankShopOrder(current)) {
            appendShopOrderStatus(order, targetStatus, "Statut livraison: " + shipmentStatus.name());
            statusChanged = true;
        }

        if (trackingUpdated && !statusChanged) {
            orderRepository.save(order);
        }
    }

    private void appendShopOrderStatus(Order order, Status status, String comment) {
        if (order.getStatusHistory() == null) {
            order.setStatusHistory(new java.util.ArrayList<>());
        }
        StatusHistory history = StatusHistory.builder()
                .order(order)
                .status(status)
                .comment(comment)
                .changedAt(LocalDateTime.now())
                .build();
        order.getStatusHistory().add(history);
        order.setCurrentStatus(status);
        orderRepository.save(order);
    }

    private static int rankCoreCommande(StatutCommande status) {
        if (status == null) return -1;
        return switch (status) {
            case CREEE -> 0;
            case PAYEE -> 1;
            case EXPEDIEE -> 2;
            case LIVREE -> 3;
            case ANNULEE -> 4;
            case REMBOURSEE -> 5;
        };
    }

    private static int rankShopOrder(Status status) {
        if (status == null) return -1;
        return switch (status) {
            case PENDING -> 0;
            case PAID -> 1;
            case PROCESSING -> 2;
            case READY_TO_DELIVER -> 3;
            case DELIVERY_IN_PROGRESS -> 4;
            case DELIVERED -> 5;
            case CANCELED -> 6;
        };
    }

    private static Long tryExtractShopOrderId(String coreOrderId) {
        if (coreOrderId == null) return null;
        String s = coreOrderId.trim();
        if (s.isBlank()) return null;

        String upper = s.toUpperCase(java.util.Locale.ROOT);
        if (!upper.startsWith("ORD-")) return null;

        String tail = s.substring(4).trim();
        if (!tail.matches("^\\d+$")) return null;
        try {
            return Long.parseLong(tail);
        } catch (NumberFormatException ex) {
            return null;
        }
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

    private Livraison resolveShipmentFromQr(String qr) {
        String raw = qr == null ? "" : qr.trim();
        if (raw.isBlank()) return null;

        String normalized = raw;
        if (normalized.startsWith("SHIP:") || normalized.startsWith("ship:")) {
            normalized = normalized.substring(5).trim();
        } else if (normalized.startsWith("ORDER:") || normalized.startsWith("order:")) {
            normalized = normalized.substring(6).trim();
        }

        Livraison byId = livraisonRepository.findById(normalized).orElse(null);
        if (byId != null) return byId;

        return livraisonRepository.findByCommande_Id(normalized).orElse(null);
    }

    private String generate4DigitCode() {
        int n = secureRandom.nextInt(10000);
        return String.format("%04d", n);
    }

    private List<ShipmentItemDto> resolveShipmentItems(Commande commande) {
        if (commande == null || commandeLigneRepository == null) {
            return List.of();
        }
        List<CommandeLigne> lignes = commandeLigneRepository.findByCommande(commande);
        if (lignes == null || lignes.isEmpty()) {
            return List.of();
        }

        return lignes.stream()
                .filter(Objects::nonNull)
                .map((line) -> {
                    String productId = line.getProduit() != null ? line.getProduit().getId() : null;
                    String productName = line.getProduit() != null ? trimToNull(line.getProduit().getNom()) : null;
                    if (productName == null) productName = "Produit";

                    Integer qty = line.getQuantite();
                    BigDecimal unit = line.getPrixUnitaire();
                    BigDecimal total = null;
                    if (qty != null && unit != null) {
                        total = unit.multiply(BigDecimal.valueOf(qty));
                    }
                    return new ShipmentItemDto(productId, productName, qty, unit, total);
                })
                .toList();
    }

    private String resolveCustomerAddress(Utilisateur customer) {
        if (customer == null) return null;

        if (customerAddressRepository == null) {
            String city = trimToNull(customer.getVille());
            String country = trimToNull(customer.getPays());
            String fallback = String.join(", ", List.of(city, country).stream().filter(Objects::nonNull).toList());
            return fallback.isBlank() ? null : fallback;
        }

        List<CustomerAddress> addresses = customerAddressRepository.findByUtilisateur_Id(customer.getId());
        if (addresses == null || addresses.isEmpty()) {
            String city = trimToNull(customer.getVille());
            String country = trimToNull(customer.getPays());
            String fallback = String.join(", ", List.of(city, country).stream().filter(Objects::nonNull).toList());
            return fallback.isBlank() ? null : fallback;
        }

        CustomerAddress chosen = null;
        for (CustomerAddress addr : addresses) {
            if (addr != null && Boolean.TRUE.equals(addr.getIsDefault())) {
                chosen = addr;
                break;
            }
        }
        if (chosen == null) {
            chosen = addresses.get(0);
        }

        String line = trimToNull(chosen.getAddressLine());
        String city = trimToNull(chosen.getCity());
        String postal = trimToNull(chosen.getPostalCode());
        String country = trimToNull(chosen.getCountry());

        String cityPart = String.join(" ", List.of(postal, city).stream().filter(Objects::nonNull).toList()).trim();
        List<String> parts = List.of(line, cityPart.isBlank() ? null : cityPart, country);
        String out = String.join(", ", parts.stream().filter(Objects::nonNull).toList()).trim();
        return out.isBlank() ? null : out;
    }

    private boolean resolvePaidStatus(Commande commande) {
        if (commande == null || paiementRepository == null) {
            return false;
        }
        List<Paiement> payments = paiementRepository.findByCommande(commande);
        if (payments == null || payments.isEmpty()) {
            return false;
        }
        return payments.stream().anyMatch((p) -> p != null && p.getStatut() == StatutPaiement.SUCCES);
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

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String s = value.trim();
        return s.isEmpty() ? null : s;
    }
}
