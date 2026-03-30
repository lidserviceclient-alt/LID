package com.lifeevent.lid.backoffice.lid.product.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeProductDto {
    private Long id;

    @JsonAlias("referenceProduitPartenaire")
    private String sku;

    private String ean;
    private String name;
    private String description;
    @JsonAlias({"main_image_url", "mainImage", "imageUrl"})
    private String mainImageUrl;
    @JsonAlias({"secondaryImages", "secondary_image_urls"})
    private List<String> secondaryImageUrls;
    private String brand;
    private Double price;
    private Float vat;
    private String status;

    /**
     * Catégorie principale (id)
     * Le front envoie parfois "category" au lieu de "categoryId".
     */
    private String categoryId;
    @JsonAlias({"categoryBusinessId", "category_business_id"})
    private String categoryBusinessId;

    /**
     * Libellé de la catégorie (affichage).
     * En création, le front peut envoyer l'id via le champ "category".
     */
    @JsonAlias("category")
    private String category;

    /**
     * Stock agrégé (choix service).
     */
    private Integer stock;

    private Boolean isFeatured;
    private Boolean isBestSeller;
}
