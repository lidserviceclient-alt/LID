package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.StatutProduit;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    @NotBlank(message = "La référence partenaire est obligatoire")
    private String referenceProduitPartenaire;

    private String ean;
    private String description;
    private String img;
    private String brand;

    @NotNull(message = "Le prix est obligatoire")
    @PositiveOrZero(message = "Le prix doit être positif")
    private BigDecimal price;

    @PositiveOrZero
    private BigDecimal vat;

    private String status; // ACTIVE, DRAFT, ARCHIVED

    private List<String> categories;
    private String category; // Single category ID fallback

    @PositiveOrZero
    private Integer stock;

    private String sku; // can be same as referenceProduitPartenaire
}
