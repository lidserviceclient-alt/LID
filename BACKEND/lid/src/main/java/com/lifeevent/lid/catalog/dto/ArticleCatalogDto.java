package com.lifeevent.lid.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour l'affichage en catalogue
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleCatalogDto {
    
    private Long id;
    
    private String name;
    
    private String image;
    
    private Double price;
    
    private Float discountPercent;
    
    private String brand;
    
    private Boolean isFlashSale;
    
    private Boolean isFeatured;
    
    private Boolean isBestSeller;
}
