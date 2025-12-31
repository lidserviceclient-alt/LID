package com.lifeevent.lid.cart.dto;

import com.lifeevent.lid.article.dto.ArticleDto;
import com.lifeevent.lid.customer.dto.CustomerDto;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDto {
    private Integer id;
    private CustomerDto customer;
    private List<ArticleDto> articles;
}
