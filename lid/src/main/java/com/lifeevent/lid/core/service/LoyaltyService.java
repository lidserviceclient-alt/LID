package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.LoyaltyConfigDto;
import com.lifeevent.lid.core.dto.LoyaltyCustomerDto;
import com.lifeevent.lid.core.dto.LoyaltyOverviewDto;
import com.lifeevent.lid.core.dto.LoyaltyTierDto;
import com.lifeevent.lid.core.dto.LoyaltyTxDto;
import com.lifeevent.lid.core.dto.CreateLoyaltyTierRequest;
import com.lifeevent.lid.core.dto.AdjustLoyaltyPointsRequest;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class LoyaltyService {

    private static final BigDecimal DEFAULT_POINTS_PER_FCFA = new BigDecimal("0.001");
    private static final BigDecimal DEFAULT_VALUE_PER_POINT = new BigDecimal("0.10");
    private static final int DEFAULT_RETENTION_DAYS = 30;
    private static final Pattern DISCOUNT_PERCENT_PATTERN = Pattern.compile("(-?\\s*\\d{1,2}(?:[\\.,]\\d{1,2})?)\\s*%");

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

    public record LoyaltyPricing(
            boolean applied,
            String tierName,
            BigDecimal discountPercent,
            BigDecimal discountAmount,
            int points
    ) {
    }

    @Transactional
    public LoyaltyOverviewDto overview() {
        LoyaltyConfig config = ensureConfig();
        ensureDefaultTiers();

        long points = customerLoyaltyRepository.sumAllPoints();
        BigDecimal value = BigDecimal.valueOf(points).multiply(config.getValuePerPointFcfa()).setScale(0, RoundingMode.HALF_UP);

        List<LoyaltyTier> tiers = loadTiersOrdered();
        int vipThreshold = tiers.size() >= 2 && tiers.get(1).getMinPoints() != null ? tiers.get(1).getMinPoints() : 0;
        long vipMembers = customerLoyaltyRepository.countByPointsAtLeast(vipThreshold);

        LocalDateTime from = LocalDateTime.now().minusDays(Math.max(1, config.getRetentionDays()));
        long clients = commandeRepository.countDistinctClientsSince(from);
        long repeat = commandeRepository.countRepeatClientsSince(from);
        double retention = clients > 0 ? (repeat * 100.0) / clients : 0.0;

        return new LoyaltyOverviewDto(vipMembers, points, value, round1(retention));
    }

    @Transactional(readOnly = true)
    public java.util.List<LoyaltyCustomerDto> topCustomers(int limit) {
        ensureDefaultTiers();
        int size = Math.max(1, Math.min(limit, 50));
        List<CustomerLoyalty> list = customerLoyaltyRepository.findAll(
                PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "points").and(Sort.by(Sort.Direction.DESC, "dateMiseAJour")))
        ).getContent();

        return list.stream()
                .filter((c) -> c != null && c.getUtilisateur() != null && c.getUtilisateur().getRole() == RoleUtilisateur.CLIENT)
                .map((c) -> {
                    int points = c.getPoints() == null ? 0 : c.getPoints();
                    LoyaltyTier tier = resolveTierForPoints(points);
                    Utilisateur u = c.getUtilisateur();
                    return new LoyaltyCustomerDto(
                            u.getId(),
                            u.getEmail(),
                            u.getTelephone(),
                            points,
                            tier != null ? tier.getName() : null
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<LoyaltyCustomerDto> searchCustomers(String q, int page, int size) {
        ensureDefaultTiers();
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 50));
        Page<CustomerLoyalty> res = customerLoyaltyRepository.search(q != null && !q.isBlank() ? q.trim() : null,
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "points").and(Sort.by(Sort.Direction.DESC, "dateMiseAJour"))));

        return res.map((c) -> {
            Utilisateur u = c.getUtilisateur();
            int points = c.getPoints() == null ? 0 : c.getPoints();
            LoyaltyTier tier = resolveTierForPoints(points);
            return new LoyaltyCustomerDto(
                    u.getId(),
                    u.getEmail(),
                    u.getTelephone(),
                    points,
                    tier != null ? tier.getName() : null
            );
        });
    }

    @Transactional
    public LoyaltyTierDto createTier(CreateLoyaltyTierRequest request) {
        ensureDefaultTiers();
        String name = request.getName() != null ? request.getName().trim() : "";
        if (name.isBlank()) throw new RuntimeException("Nom obligatoire");
        if (request.getMinPoints() == null || request.getMinPoints() < 0) throw new RuntimeException("Points requis invalides");
        loyaltyTierRepository.findByNameIgnoreCase(name).ifPresent((existing) -> {
            throw new RuntimeException("Ce niveau existe déjà");
        });

        LoyaltyTier tier = new LoyaltyTier();
        tier.setName(name);
        tier.setMinPoints(request.getMinPoints());
        tier.setBenefits(request.getBenefits() != null && !request.getBenefits().trim().isBlank() ? request.getBenefits().trim() : null);
        tier.setRankOrder(0);
        tier = loyaltyTierRepository.save(tier);
        normalizeRanks();

        return new LoyaltyTierDto(tier.getId(), tier.getName(), tier.getMinPoints(), 0L, tier.getBenefits());
    }

    @Transactional
    public void deleteTier(String id) {
        if (id == null || id.isBlank()) throw new RuntimeException("Niveau introuvable");
        LoyaltyTier tier = loyaltyTierRepository.findById(id).orElseThrow(() -> new RuntimeException("Niveau introuvable"));
        long count = loyaltyTierRepository.count();
        if (count <= 1) throw new RuntimeException("Impossible de supprimer le dernier niveau");
        loyaltyTierRepository.delete(tier);
        normalizeRanks();
    }

    @Transactional
    public LoyaltyCustomerDto getCustomer(String userId) {
        if (userId == null || userId.isBlank()) throw new RuntimeException("Client introuvable");
        Utilisateur u = utilisateurRepository.findById(userId).orElseThrow(() -> new RuntimeException("Client introuvable"));
        if (u.getRole() != RoleUtilisateur.CLIENT) throw new RuntimeException("Client introuvable");

        CustomerLoyalty loyalty = customerLoyaltyRepository.findByUtilisateurId(u.getId()).orElseGet(() -> {
            CustomerLoyalty cl = new CustomerLoyalty();
            cl.setUtilisateur(u);
            cl.setPoints(0);
            cl.setDateMiseAJour(java.time.LocalDateTime.now());
            return customerLoyaltyRepository.save(cl);
        });

        int points = loyalty.getPoints() == null ? 0 : loyalty.getPoints();
        LoyaltyTier tier = resolveTierForPoints(points);
        return new LoyaltyCustomerDto(u.getId(), u.getEmail(), u.getTelephone(), points, tier != null ? tier.getName() : null);
    }

    @Transactional(readOnly = true)
    public Page<LoyaltyTxDto> listTransactions(String userId, int page, int size) {
        if (userId == null || userId.isBlank()) throw new RuntimeException("Client introuvable");
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 50));
        Page<LoyaltyPointTransaction> txs = loyaltyPointTransactionRepository.findByUtilisateurIdOrderByDateCreationDesc(
                userId,
                PageRequest.of(safePage, safeSize)
        );
        return txs.map((tx) -> new LoyaltyTxDto(
                tx.getId(),
                tx.getType(),
                tx.getPoints(),
                tx.getReason(),
                tx.getCommande() != null ? tx.getCommande().getId() : null,
                tx.getDateCreation()
        ));
    }

    @Transactional
    public LoyaltyCustomerDto adjustPoints(String userId, AdjustLoyaltyPointsRequest request) {
        if (request == null || request.getDeltaPoints() == null) throw new RuntimeException("Requête invalide");
        int delta = request.getDeltaPoints();
        if (delta == 0) throw new RuntimeException("Delta invalide");

        CustomerLoyalty loyalty = customerLoyaltyRepository.findByUtilisateurId(userId).orElseThrow(() -> new RuntimeException("Client introuvable"));
        int current = loyalty.getPoints() == null ? 0 : loyalty.getPoints();
        int next = current + delta;
        if (next < 0) throw new RuntimeException("Points insuffisants");

        loyalty.setPoints(next);
        loyalty.setDateMiseAJour(java.time.LocalDateTime.now());
        customerLoyaltyRepository.save(loyalty);

        LoyaltyPointTransaction tx = new LoyaltyPointTransaction();
        tx.setUtilisateur(loyalty.getUtilisateur());
        tx.setCommande(null);
        tx.setPoints(delta);
        tx.setType(LoyaltyPointTransaction.Type.ADJUSTMENT.name());
        String reason = request.getReason() != null ? request.getReason().trim() : "";
        tx.setReason(reason.isBlank() ? null : reason);
        loyaltyPointTransactionRepository.save(tx);

        return getCustomer(userId);
    }

    @Transactional(readOnly = true)
    public LoyaltyPricing quotePricingForEmail(String email, BigDecimal subTotal, boolean promoApplied) {
        if (promoApplied) return new LoyaltyPricing(false, null, BigDecimal.ZERO, BigDecimal.ZERO, 0);
        if (subTotal == null || subTotal.compareTo(BigDecimal.ZERO) <= 0) return new LoyaltyPricing(false, null, BigDecimal.ZERO, BigDecimal.ZERO, 0);
        String safeEmail = email == null ? "" : email.trim();
        if (safeEmail.isBlank()) return new LoyaltyPricing(false, null, BigDecimal.ZERO, BigDecimal.ZERO, 0);

        ensureDefaultTiers();
        Utilisateur u = utilisateurRepository.findByEmail(safeEmail).orElse(null);
        if (u == null || u.getId() == null) return new LoyaltyPricing(false, null, BigDecimal.ZERO, BigDecimal.ZERO, 0);

        CustomerLoyalty loyalty = customerLoyaltyRepository.findByUtilisateurId(u.getId()).orElse(null);
        int points = loyalty != null && loyalty.getPoints() != null ? loyalty.getPoints() : 0;

        LoyaltyTier tier = resolveTierForPoints(points);
        if (tier == null) return new LoyaltyPricing(false, null, BigDecimal.ZERO, BigDecimal.ZERO, points);

        BigDecimal percent = parseDiscountPercent(tier.getBenefits());
        if (percent.compareTo(BigDecimal.ZERO) <= 0) return new LoyaltyPricing(false, tier.getName(), BigDecimal.ZERO, BigDecimal.ZERO, points);

        BigDecimal discount = subTotal.multiply(percent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        if (discount.compareTo(BigDecimal.ZERO) <= 0) return new LoyaltyPricing(false, tier.getName(), percent, BigDecimal.ZERO, points);
        if (discount.compareTo(subTotal) > 0) discount = subTotal;

        return new LoyaltyPricing(true, tier.getName(), percent, discount, points);
    }

    @Transactional
    public List<LoyaltyTierDto> listTiers() {
        ensureDefaultTiers();
        List<LoyaltyTier> tiers = loadTiersOrdered();
        return tiers.stream()
                .map((t) -> {
                    Integer max = null;
                    int idx = tiers.indexOf(t);
                    if (idx >= 0 && idx + 1 < tiers.size()) {
                        max = tiers.get(idx + 1).getMinPoints();
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

        normalizeRanks();
        List<LoyaltyTier> ordered = loadTiersOrdered();
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
        tx.setType(LoyaltyPointTransaction.Type.ORDER.name());
        tx.setReason("Commande livrée");
        loyaltyPointTransactionRepository.save(tx);
    }

    private LoyaltyTier resolveTierForPoints(int points) {
        List<LoyaltyTier> tiers = loadTiersOrdered();
        LoyaltyTier best = null;
        for (LoyaltyTier t : tiers) {
            if (t == null || t.getMinPoints() == null) continue;
            if (points < t.getMinPoints()) continue;
            best = t;
        }
        return best;
    }

    @Transactional(readOnly = true)
    public String tierNameForPoints(int points) {
        ensureDefaultTiers();
        LoyaltyTier tier = resolveTierForPoints(points);
        return tier != null ? tier.getName() : null;
    }

    private List<LoyaltyTier> loadTiersOrdered() {
        List<LoyaltyTier> tiers = new ArrayList<>(loyaltyTierRepository.findAll());
        tiers.sort(Comparator
                .comparing(LoyaltyTier::getMinPoints, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(LoyaltyTier::getRankOrder, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(LoyaltyTier::getName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));
        return tiers;
    }

    private void normalizeRanks() {
        List<LoyaltyTier> tiers = loadTiersOrdered();
        boolean changed = false;
        for (int i = 0; i < tiers.size(); i++) {
            LoyaltyTier t = tiers.get(i);
            int desired = i + 1;
            if (t.getRankOrder() == null || t.getRankOrder() != desired) {
                t.setRankOrder(desired);
                changed = true;
            }
        }
        if (changed) {
            loyaltyTierRepository.saveAll(tiers);
        }
    }

    private static BigDecimal parseDiscountPercent(String benefits) {
        String text = benefits == null ? "" : benefits;
        Matcher m = DISCOUNT_PERCENT_PATTERN.matcher(text);
        BigDecimal best = BigDecimal.ZERO;
        while (m.find()) {
            String raw = m.group(1);
            if (raw == null) continue;
            String normalized = raw.replace(" ", "").replace(",", ".");
            if (normalized.startsWith("-")) normalized = normalized.substring(1);
            try {
                BigDecimal v = new BigDecimal(normalized);
                if (v.compareTo(best) > 0) best = v;
            } catch (Exception ignored) {
            }
        }
        if (best.compareTo(BigDecimal.ZERO) < 0) return BigDecimal.ZERO;
        if (best.compareTo(BigDecimal.valueOf(100)) > 0) return BigDecimal.valueOf(100);
        return best;
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
