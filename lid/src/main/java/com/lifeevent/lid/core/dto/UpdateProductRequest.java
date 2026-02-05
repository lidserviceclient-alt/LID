package com.lifeevent.lid.core.dto;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {
    private String name;
    private String description;
    private String brand;
    private String status; // ACTIVE, DRAFT, ARCHIVED or ACTIF, BROUILLON, ARCHIVE

    @PositiveOrZero
    private BigDecimal price;

    @PositiveOrZero
    private BigDecimal vat;

    private String categoryId; // cible: categorie.id
    private String category;   // alias pour frontend
    private String referencePartenaire; // SKU

    @PositiveOrZero
    private Integer stock; // quantite_disponible
}

