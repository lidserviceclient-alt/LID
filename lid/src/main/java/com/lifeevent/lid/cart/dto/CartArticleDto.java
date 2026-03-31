package com.lifeevent.lid.cart.dto;

import com.lifeevent.lid.article.dto.ArticleDto;
import lombok.*;

/**
 * DTO pour un article dans le panier (avec quantité)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartArticleDto {
    private Integer id;
    private ArticleDto article;
    private Integer quantity;
    private String color;
    private String size;
}
