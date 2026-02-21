package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.NiveauCategorie;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UpsertCategoryRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String slug;

    private String imageUrl;

    @NotNull(message = "Le niveau est obligatoire")
    private NiveauCategorie niveau;

    private Integer ordre;

    private Boolean estActive;

    private Boolean isFeatured;

    private String parentId;

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public NiveauCategorie getNiveau() {
        return niveau;
    }

    public void setNiveau(NiveauCategorie niveau) {
        this.niveau = niveau;
    }

    public Integer getOrdre() {
        return ordre;
    }

    public void setOrdre(Integer ordre) {
        this.ordre = ordre;
    }

    public Boolean getEstActive() {
        return estActive;
    }

    public void setEstActive(Boolean estActive) {
        this.estActive = estActive;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public Boolean getIsFeatured() {
        return isFeatured;
    }

    public void setIsFeatured(Boolean isFeatured) {
        this.isFeatured = isFeatured;
    }
}
