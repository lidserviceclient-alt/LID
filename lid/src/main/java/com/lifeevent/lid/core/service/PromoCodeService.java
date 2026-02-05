package com.lifeevent.lid.core.service;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.core.dto.PromoCodeDto;
import com.lifeevent.lid.core.dto.PromoCodeStatsDto;
import com.lifeevent.lid.core.dto.UpsertPromoCodeRequest;
import com.lifeevent.lid.core.entity.Boutique;
import com.lifeevent.lid.core.entity.CodePromo;
import com.lifeevent.lid.core.entity.CodePromoUtilisation;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.enums.CibleCodePromo;
import com.lifeevent.lid.core.repository.BoutiqueRepository;
import com.lifeevent.lid.core.repository.CodePromoRepository;
import com.lifeevent.lid.core.repository.CodePromoUtilisationRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class PromoCodeService {

    private static final int DEFAULT_SERIES_DAYS = 30;
    private static final int MAX_SERIES_DAYS = 365;

    private final CodePromoRepository codePromoRepository;
    private final CodePromoUtilisationRepository utilisationRepository;
    private final BoutiqueRepository boutiqueRepository;
    private final UtilisateurRepository utilisateurRepository;

    public PromoCodeService(
            CodePromoRepository codePromoRepository,
            CodePromoUtilisationRepository utilisationRepository,
            BoutiqueRepository boutiqueRepository,
            UtilisateurRepository utilisateurRepository
    ) {
        this.codePromoRepository = codePromoRepository;
        this.utilisationRepository = utilisationRepository;
        this.boutiqueRepository = boutiqueRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Transactional(readOnly = true)
    public List<PromoCodeDto> listAll() {
        Sort sort = Sort.by(Sort.Direction.DESC, "dateCreation").and(Sort.by("code").ascending());
        List<CodePromo> codes = codePromoRepository.findAll(sort);

        Map<String, CodePromoUtilisationRepository.PromoUsageAgg> aggByPromoId = new HashMap<>();
        for (CodePromoUtilisationRepository.PromoUsageAgg agg : utilisationRepository.aggregateUsageByPromoId()) {
            aggByPromoId.put(agg.getPromoId(), agg);
        }

        return codes.stream()
                .map((promo) -> toDto(promo, aggByPromoId.get(promo.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public PromoCodeDto getById(String id) {
        CodePromo promo = codePromoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CodePromo", "id", id));

        CodePromoUtilisationRepository.PromoUsageAgg agg = utilisationRepository.aggregateUsageByPromoId().stream()
                .filter((a) -> id.equals(a.getPromoId()))
                .findFirst()
                .orElse(null);

        return toDto(promo, agg);
    }

    @Transactional
    public PromoCodeDto create(UpsertPromoCodeRequest request) {
        CodePromo promo = new CodePromo();
        applyRequest(promo, request);
        promo = codePromoRepository.save(promo);
        return toDto(promo, null);
    }

    @Transactional
    public PromoCodeDto update(String id, UpsertPromoCodeRequest request) {
        CodePromo promo = codePromoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CodePromo", "id", id));
        applyRequest(promo, request);
        promo = codePromoRepository.save(promo);
        return toDto(promo, null);
    }

    @Transactional
    public void delete(String id) {
        if (!codePromoRepository.existsById(id)) {
            throw new ResourceNotFoundException("CodePromo", "id", id);
        }
        codePromoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public PromoCodeStatsDto getStats(Integer seriesDays) {
        int days = normalizeSeriesDays(seriesDays);
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(days - 1L);
        LocalDateTime from = LocalDateTime.of(start, LocalTime.MIN);

        List<CodePromoUtilisation> utilisations = utilisationRepository.findByDateUtilisationAfter(from);
        Map<LocalDate, Integer> countsByDay = new HashMap<>();
        BigDecimal totalReduction = BigDecimal.ZERO;
        long totalUsages = 0;

        for (CodePromoUtilisation utilisation : utilisations) {
            if (utilisation.getDateUtilisation() == null) continue;
            LocalDate day = utilisation.getDateUtilisation().toLocalDate();
            countsByDay.merge(day, 1, Integer::sum);
            if (utilisation.getMontantReduction() != null) {
                totalReduction = totalReduction.add(utilisation.getMontantReduction());
            }
            totalUsages++;
        }

        List<Integer> series = new ArrayList<>(days);
        for (int i = 0; i < days; i++) {
            LocalDate day = start.plusDays(i);
            series.add(countsByDay.getOrDefault(day, 0));
        }

        return new PromoCodeStatsDto(days, series, totalUsages, totalReduction);
    }

    private static int normalizeSeriesDays(Integer days) {
        if (days == null) return DEFAULT_SERIES_DAYS;
        int safe = Math.max(1, days);
        return Math.min(safe, MAX_SERIES_DAYS);
    }

    private void applyRequest(CodePromo promo, UpsertPromoCodeRequest request) {
        String code = request.getCode() != null ? request.getCode().trim() : "";
        if (code.isBlank()) {
            throw new IllegalArgumentException("Le code est obligatoire");
        }
        code = code.toUpperCase(Locale.ROOT);
        if (code.length() > 12) {
            throw new IllegalArgumentException("Le code ne doit pas dÃ©passer 12 caractÃ¨res");
        }

        ensureUniqueCode(code, promo.getId());

        CibleCodePromo cible = request.getCible();
        if (cible == null) {
            throw new IllegalArgumentException("La cible est obligatoire");
        }

        String boutiqueId = request.getBoutiqueId() != null ? request.getBoutiqueId().trim() : "";
        String utilisateurId = request.getUtilisateurId() != null ? request.getUtilisateurId().trim() : "";

        Boutique boutique = null;
        Utilisateur utilisateur = null;

        if (cible == CibleCodePromo.GLOBAL) {
            if (!boutiqueId.isBlank() || !utilisateurId.isBlank()) {
                throw new IllegalArgumentException("Pour la cible GLOBAL, boutiqueId et utilisateurId doivent Ãªtre vides.");
            }
        } else if (cible == CibleCodePromo.BOUTIQUE) {
            if (boutiqueId.isBlank()) {
                throw new IllegalArgumentException("boutiqueId est obligatoire pour la cible BOUTIQUE.");
            }
            if (!utilisateurId.isBlank()) {
                throw new IllegalArgumentException("utilisateurId doit Ãªtre vide pour la cible BOUTIQUE.");
            }
            boutique = boutiqueRepository.findById(boutiqueId)
                    .orElseThrow(() -> new ResourceNotFoundException("Boutique", "id", boutiqueId));
        } else if (cible == CibleCodePromo.UTILISATEUR) {
            if (utilisateurId.isBlank()) {
                throw new IllegalArgumentException("utilisateurId est obligatoire pour la cible UTILISATEUR.");
            }
            if (!boutiqueId.isBlank()) {
                throw new IllegalArgumentException("boutiqueId doit Ãªtre vide pour la cible UTILISATEUR.");
            }
            utilisateur = utilisateurRepository.findById(utilisateurId)
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", utilisateurId));
        }

        if (request.getPourcentage() == null) {
            throw new IllegalArgumentException("Le pourcentage est obligatoire");
        }
        if (request.getPourcentage().compareTo(BigDecimal.ZERO) < 0 || request.getPourcentage().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Le pourcentage doit Ãªtre compris entre 0 et 100.");
        }

        if (request.getDateDebut() != null && request.getDateFin() != null
                && request.getDateFin().isBefore(request.getDateDebut())) {
            throw new IllegalArgumentException("La date de fin doit Ãªtre postÃ©rieure Ã  la date de dÃ©but.");
        }

        promo.setCode(code);
        promo.setDescription(request.getDescription() != null && !request.getDescription().trim().isBlank()
                ? request.getDescription().trim()
                : null);
        promo.setPourcentage(request.getPourcentage());
        promo.setCible(cible);
        promo.setBoutique(boutique);
        promo.setUtilisateur(utilisateur);
        promo.setMontantMinCommande(request.getMontantMinCommande());
        promo.setDateDebut(request.getDateDebut());
        promo.setDateFin(request.getDateFin());
        promo.setUsageMax(request.getUsageMax());
        promo.setUsageMaxParUtilisateur(request.getUsageMaxParUtilisateur() != null ? request.getUsageMaxParUtilisateur() : 1);
        promo.setEstActif(request.getEstActif() != null ? request.getEstActif() : Boolean.TRUE);
    }

    private void ensureUniqueCode(String code, String excludeId) {
        codePromoRepository.findByCodeIgnoreCase(code)
                .ifPresent(existing -> {
                    if (excludeId == null || !excludeId.equals(existing.getId())) {
                        throw new IllegalArgumentException("Ce code promo existe dÃ©jÃ .");
                    }
                });
    }

    private static PromoCodeDto toDto(CodePromo promo, CodePromoUtilisationRepository.PromoUsageAgg agg) {
        Boutique boutique = promo.getBoutique();
        Utilisateur utilisateur = promo.getUtilisateur();
        BigDecimal totalReduction = agg != null && agg.getTotalReduction() != null ? agg.getTotalReduction() : BigDecimal.ZERO;
        long usageCount = agg != null ? agg.getUsageCount() : 0;

        return new PromoCodeDto(
                promo.getId(),
                promo.getCode(),
                promo.getDescription(),
                promo.getPourcentage(),
                promo.getCible(),
                boutique != null ? boutique.getId() : null,
                boutique != null ? boutique.getNom() : null,
                utilisateur != null ? utilisateur.getId() : null,
                utilisateur != null ? utilisateur.getEmail() : null,
                promo.getMontantMinCommande(),
                promo.getDateDebut(),
                promo.getDateFin(),
                promo.getUsageMax(),
                promo.getUsageMaxParUtilisateur(),
                promo.getEstActif(),
                promo.getDateCreation(),
                usageCount,
                totalReduction
        );
    }
}

