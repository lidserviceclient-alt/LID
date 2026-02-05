package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.CibleCodePromo;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class UpsertPromoCodeRequest {

    @NotBlank(message = "Le code est obligatoire")
    @Size(max = 12, message = "Le code ne doit pas dÃ©passer 12 caractÃ¨res")
    private String code;

    private String description;

    @NotNull(message = "Le pourcentage est obligatoire")
    @DecimalMin(value = "0", inclusive = true, message = "Le pourcentage doit Ãªtre positif")
    @DecimalMax(value = "100", inclusive = true, message = "Le pourcentage ne peut pas dÃ©passer 100")
    private BigDecimal pourcentage;

    @NotNull(message = "La cible est obligatoire")
    private CibleCodePromo cible;

    private String boutiqueId;

    private String utilisateurId;

    @DecimalMin(value = "0", inclusive = true, message = "Le montant minimum doit Ãªtre positif")
    private BigDecimal montantMinCommande;

    private LocalDateTime dateDebut;

    private LocalDateTime dateFin;

    @Min(value = 1, message = "Le nombre d'usages max doit Ãªtre >= 1")
    private Integer usageMax;

    @Min(value = 1, message = "Le nombre d'usages max par utilisateur doit Ãªtre >= 1")
    private Integer usageMaxParUtilisateur;

    private Boolean estActif;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPourcentage() {
        return pourcentage;
    }

    public void setPourcentage(BigDecimal pourcentage) {
        this.pourcentage = pourcentage;
    }

    public CibleCodePromo getCible() {
        return cible;
    }

    public void setCible(CibleCodePromo cible) {
        this.cible = cible;
    }

    public String getBoutiqueId() {
        return boutiqueId;
    }

    public void setBoutiqueId(String boutiqueId) {
        this.boutiqueId = boutiqueId;
    }

    public String getUtilisateurId() {
        return utilisateurId;
    }

    public void setUtilisateurId(String utilisateurId) {
        this.utilisateurId = utilisateurId;
    }

    public BigDecimal getMontantMinCommande() {
        return montantMinCommande;
    }

    public void setMontantMinCommande(BigDecimal montantMinCommande) {
        this.montantMinCommande = montantMinCommande;
    }

    public LocalDateTime getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDateTime dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDateTime getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDateTime dateFin) {
        this.dateFin = dateFin;
    }

    public Integer getUsageMax() {
        return usageMax;
    }

    public void setUsageMax(Integer usageMax) {
        this.usageMax = usageMax;
    }

    public Integer getUsageMaxParUtilisateur() {
        return usageMaxParUtilisateur;
    }

    public void setUsageMaxParUtilisateur(Integer usageMaxParUtilisateur) {
        this.usageMaxParUtilisateur = usageMaxParUtilisateur;
    }

    public Boolean getEstActif() {
        return estActif;
    }

    public void setEstActif(Boolean estActif) {
        this.estActif = estActif;
    }
}

