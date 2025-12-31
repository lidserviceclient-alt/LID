package com.lifeevent.lid.article.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArticleDto {
    private Long id;
    private String name;
    private Integer price;
    private String img;
    private String ean;
    private Float vat;
}
