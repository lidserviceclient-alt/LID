package com.lifeevent.lid.batch.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleCsvDto {

    private String referencePartenaire;
    private String referenceProduitPartenaire;
    private String title;
    private String description;
    private String category;
    private String brand;
    private BigDecimal price;
    private String currency;
    private Integer stock;
    private BigDecimal weightKg;
    private String imageUrl;
    private String status;
}
