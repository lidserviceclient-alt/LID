package com.lifeevent.lid.batch.dto;

import com.lifeevent.lid.article.enumeration.ArticleStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleCsvDto {

    private String referenceProduitPartenaire;
    private String ean;

    private String title;
    private String description;
    private String category;
    private String brand;

    private BigDecimal price;
    private String currency;
    private Integer stock;
    private BigDecimal weightKg;

    private String imageUrl;

    private ArticleStatus status;

    private Boolean isFeatured;
    private Boolean isBestSeller;
    private Boolean isFlashSale;
}
