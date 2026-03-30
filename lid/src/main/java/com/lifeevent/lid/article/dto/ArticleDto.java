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
    private String sku;
    private String name;
    private Double price;
    private String mainImageUrl;
    private List<String> secondaryImageUrls;
    private String ean;
    private Float vat;

    private List<CategoryDto> categories;
}
