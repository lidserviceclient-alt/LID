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
    private Float vat;

    private List<CategoryDto> categories;
}
