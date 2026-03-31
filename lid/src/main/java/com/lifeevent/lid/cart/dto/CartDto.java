package com.lifeevent.lid.cart.dto;

import com.lifeevent.lid.user.customer.dto.CustomerDto;
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
    private List<CartArticleDto> articles;
    private List<CartItemDto> items;

    private Double totalPrice;
    private Integer totalQuantity;
}
