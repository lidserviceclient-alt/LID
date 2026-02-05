package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.LoyaltyConfigDto;
import com.lifeevent.lid.core.dto.LoyaltyOverviewDto;
import com.lifeevent.lid.core.dto.LoyaltyTierDto;
import com.lifeevent.lid.core.dto.UpdateLoyaltyTierRequest;
import com.lifeevent.lid.core.dto.UpsertLoyaltyConfigRequest;
import com.lifeevent.lid.core.entity.Commande;
import com.lifeevent.lid.core.entity.CustomerLoyalty;
import com.lifeevent.lid.core.entity.LoyaltyConfig;
import com.lifeevent.lid.core.entity.LoyaltyPointTransaction;
import com.lifeevent.lid.core.entity.LoyaltyTier;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.enums.RoleUtilisateur;
import com.lifeevent.lid.core.repository.CommandeRepository;
import com.lifeevent.lid.core.repository.CustomerLoyaltyRepository;
import com.lifeevent.lid.core.repository.LoyaltyConfigRepository;
import com.lifeevent.lid.core.repository.LoyaltyPointTransactionRepository;
import com.lifeevent.lid.core.repository.LoyaltyTierRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoyaltyService {

    private static final BigDecimal DEFAULT_POINTS_PER_FCFA = new BigDecimal("0.001");
    private static final BigDecimal DEFAULT_VALUE_PER_POINT = new BigDecimal("0.10");
    private static final int DEFAULT_RETENTION_DAYS = 30;

    private final LoyaltyConfigRepository loyaltyConfigRepository;
    private final LoyaltyTierRepository loyaltyTierRepository;
    private final CustomerLoyaltyRepository customerLoyaltyRepository;
    private final LoyaltyPointTransactionRepository loyaltyPointTransactionRepository;
    private final CommandeRepository commandeRepository;
    private final UtilisateurRepository utilisateurRepository;

    public LoyaltyService(LoyaltyConfigRepository loyaltyConfigRepository,
                          LoyaltyTierRepository loyaltyTierRepository,
                          CustomerLoyaltyRepository customerLoyaltyRepository,
                          LoyaltyPointTransactionRepository loyaltyPointTransactionRepository,
                          CommandeRepository commandeRepository,
                          UtilisateurRepository utilisateurRepository) {
        this.loyaltyConfigRepository = loyaltyConfigRepository;
        this.loyaltyTierRepository = loyaltyTierRepository;
        this.customerLoyaltyRepository = customerLoyaltyRepository;
        this.loyaltyPointTransactionRepository = loyaltyPointTransactionRepository;
        this.commandeRepository = commandeRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Transactional
    public LoyaltyOverviewDto overview() {
        LoyaltyConfig config = ensureConfig();
        ensureDefaultTiers();

        long points = customerLoyaltyRepository.sumAllPoints();
        BigDecimal value = BigDecimal.valueOf(points).multiply(config.getValuePerPointFcfa()).setScale(0, RoundingMode.HALF_UP);

        List<LoyaltyTier> tiers = loyaltyTierRepository.findAllByOrderByRankOrderAscMinPointsAsc();
        int vipThreshold = tiers.stream()
                .filter(t -> t.getRankOrder() != null && t.getRankOrder() >= 2)
                .map(LoyaltyTier::getMinPoints)
                .filter(v -> v != null)
                .min(Integer::compareTo)
                .orElse(0);
        long vipMembers = customerLoyaltyRepository.countByPointsAtLeast(vipThreshold);

        LocalDateTime from = LocalDateTime.now().minusDays(Math.max(1, config.getRetentionDays()));
        long clients = commandeRepository.countDistinctClientsSince(from);
        long repeat = commandeRepository.countRepeatClientsSince(from);
        double retention = clients > 0 ? (repeat * 100.0) / clients : 0.0;

        return new LoyaltyOverviewDto(vipMembers, points, value, round1(retention));
    }

    @Transactional
    public List<LoyaltyTierDto> listTiers() {
        ensureDefaultTiers();
        List<LoyaltyTier> tiers = loyaltyTierRepository.findAllByOrderByRankOrderAscMinPointsAsc();
        for (int i = 0; i < tiers.size(); i++) {
            LoyaltyTier current = tiers.get(i);
            Integer max = (i + 1 < tiers.size()) ? tiers.get(i + 1).getMinPoints() : null;
            long members = customerLoyaltyRepository.countByPointsRange(current.getMinPoints(), max);
            current.setBenefits(current.getBenefits());
        }

        return tiers.stream()
                .map((t) -> {
                    Integer max = null;
                    List<LoyaltyTier> ordered = tiers;
                    int idx = ordered.indexOf(t);
                    if (idx >= 0 && idx + 1 < ordered.size()) {
                        max = ordered.get(idx + 1).getMinPoints();
                    }
                    long members = customerLoyaltyRepository.countByPointsRange(t.getMinPoints(), max);
                    return new LoyaltyTierDto(t.getId(), t.getName(), t.getMinPoints(), members, t.getBenefits());
                })
                .toList();
    }

    @Transactional
    public LoyaltyConfigDto getConfig() {
        LoyaltyConfig config = ensureConfig();
        return new LoyaltyConfigDto(config.getPointsPerFcfa(), config.getValuePerPointFcfa(), config.getRetentionDays());
    }

    @Transactional
    public LoyaltyConfigDto updateConfig(UpsertLoyaltyConfigRequest request) {
        LoyaltyConfig config = ensureConfig();
        BigDecimal pointsPerFcfa = request.getPointsPerFcfa();
        BigDecimal valuePerPoint = request.getValuePerPointFcfa();
        int retentionDays = request.getRetentionDays() != null ? request.getRetentionDays() : DEFAULT_RETENTION_DAYS;
        retentionDays = Math.max(1, Math.min(retentionDays, 365));

        if (pointsPerFcfa.compareTo(BigDecimal.ZERO) < 0) throw new RuntimeException("pointsPerFcfa invalide");
        if (valuePerPoint.compareTo(BigDecimal.ZERO) < 0) throw new RuntimeException("valuePerPointFcfa invalide");

        config.setPointsPerFcfa(pointsPerFcfa);
        config.setValuePerPointFcfa(valuePerPoint);
        config.setRetentionDays(retentionDays);
        loyaltyConfigRepository.save(config);

        return new LoyaltyConfigDto(config.getPointsPerFcfa(), config.getValuePerPointFcfa(), config.getRetentionDays());
    }

    @Transactional
    public LoyaltyTierDto updateTier(String id, UpdateLoyaltyTierRequest request) {
        LoyaltyTier tier = loyaltyTierRepository.findById(id).orElseThrow(() -> new RuntimeException("Niveau introuvable"));
        String tierId = tier.getId();
        String name = request.getName() != null ? request.getName().trim() : "";
        if (name.isBlank()) throw new RuntimeException("Nom obligatoire");
        if (request.getMinPoints() == null || request.getMinPoints() < 0) throw new RuntimeException("Points requis invalides");

        loyaltyTierRepository.findByNameIgnoreCase(name).ifPresent(existing -> {
            if (!existing.getId().equals(tierId)) {
                throw new RuntimeException("Ce niveau existe déjà");
            }
        });

        tier.setName(name);
        tier.setMinPoints(request.getMinPoints());
        tier.setBenefits(request.getBenefits() != null && !request.getBenefits().trim().isBlank() ? request.getBenefits().trim() : null);
        tier = loyaltyTierRepository.save(tier);

        List<LoyaltyTier> ordered = loyaltyTierRepository.findAllByOrderByRankOrderAscMinPointsAsc();
        Integer max = null;
        int idx = ordered.indexOf(tier);
        if (idx >= 0 && idx + 1 < ordered.size()) max = ordered.get(idx + 1).getMinPoints();
        long members = customerLoyaltyRepository.countByPointsRange(tier.getMinPoints(), max);

        return new LoyaltyTierDto(tier.getId(), tier.getName(), tier.getMinPoints(), members, tier.getBenefits());
    }

    @Transactional
    public void applyPointsForDeliveredOrder(Commande commande) {
        if (commande == null || commande.getId() == null) return;
        if (loyaltyPointTransactionRepository.existsByCommandeId(commande.getId())) return;

        Utilisateur client = commande.getClient();
        if (client == null || client.getId() == null) return;
        if (client.getRole() != RoleUtilisateur.CLIENT) return;

        LoyaltyConfig config = ensureConfig();
        BigDecimal total = commande.getMontantTotal() != null ? commande.getMontantTotal() : BigDecimal.ZERO;
        BigDecimal pointsRaw = total.multiply(config.getPointsPerFcfa());
        int points = pointsRaw.setScale(0, RoundingMode.FLOOR).intValue();
        if (points <= 0) return;

        CustomerLoyalty loyalty = customerLoyaltyRepository.findByUtilisateurId(client.getId()).orElse(null);
        if (loyalty == null) {
            loyalty = new CustomerLoyalty();
            loyalty.setUtilisateur(client);
            loyalty.setPoints(0);
        }
        loyalty.setPoints((loyalty.getPoints() != null ? loyalty.getPoints() : 0) + points);
        loyalty.setDateMiseAJour(LocalDateTime.now());
        loyalty = customerLoyaltyRepository.save(loyalty);

        LoyaltyPointTransaction tx = new LoyaltyPointTransaction();
        tx.setUtilisateur(client);
        tx.setCommande(commande);
        tx.setPoints(points);
        loyaltyPointTransactionRepository.save(tx);
    }

    private LoyaltyConfig ensureConfig() {
        return loyaltyConfigRepository.findTopByOrderByDateCreationDesc().orElseGet(() -> {
            LoyaltyConfig cfg = new LoyaltyConfig();
            cfg.setPointsPerFcfa(DEFAULT_POINTS_PER_FCFA);
            cfg.setValuePerPointFcfa(DEFAULT_VALUE_PER_POINT);
            cfg.setRetentionDays(DEFAULT_RETENTION_DAYS);
            return loyaltyConfigRepository.save(cfg);
        });
    }

    private void ensureDefaultTiers() {
        if (loyaltyTierRepository.count() > 0) return;

        LoyaltyTier bronze = new LoyaltyTier();
        bronze.setName("Bronze");
        bronze.setMinPoints(0);
        bronze.setBenefits("Livraison standard");
        bronze.setRankOrder(1);

        LoyaltyTier silver = new LoyaltyTier();
        silver.setName("Silver");
        silver.setMinPoints(500);
        silver.setBenefits("-5% sur tout");
        silver.setRankOrder(2);

        LoyaltyTier gold = new LoyaltyTier();
        gold.setName("Gold");
        gold.setMinPoints(2000);
        gold.setBenefits("-10%, Livraison 24h");
        gold.setRankOrder(3);

        LoyaltyTier platinum = new LoyaltyTier();
        platinum.setName("Platinum");
        platinum.setMinPoints(5000);
        platinum.setBenefits("-15%, Concierge");
        platinum.setRankOrder(4);

        loyaltyTierRepository.saveAll(List.of(bronze, silver, gold, platinum));

        utilisateurRepository.findByRole(RoleUtilisateur.CLIENT, org.springframework.data.domain.PageRequest.of(0, 500))
                .forEach((u) -> {
                    CustomerLoyalty cl = new CustomerLoyalty();
                    cl.setUtilisateur(u);
                    cl.setPoints(0);
                    cl.setDateMiseAJour(LocalDateTime.now());
                    customerLoyaltyRepository.save(cl);
                });
    }

    private static double round1(double v) {
        return BigDecimal.valueOf(v).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
