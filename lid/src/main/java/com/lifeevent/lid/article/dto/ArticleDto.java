package com.lifeevent.lid.article.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleDto {
    private Long id;
    private String name;
    private Double price;
    private String img;
    private String ean;
    private String description;
    private String brand;
    private Float vat;
    private String referenceProduitPartenaire;
    private Float discountPercent;
    private Boolean isFlashSale;
    private Boolean isFeatured;
    private Boolean isBestSeller;

    private List<CategoryDto> categories;
}
