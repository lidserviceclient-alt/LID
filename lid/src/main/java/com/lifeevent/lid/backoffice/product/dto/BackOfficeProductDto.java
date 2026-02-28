package com.lifeevent.lid.backoffice.product.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.*;

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
    private String img;
    private String brand;
    private Double price;
    private Float vat;
    private String status;

    /**
     * Catégorie principale (id)
     * Le front envoie parfois "category" au lieu de "categoryId".
     */
    private String categoryId;

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
