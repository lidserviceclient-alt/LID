package com.lifeevent.lid.backoffice.partner.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerOrderItemDto {
    private Long articleId;
    private String name;
    private Integer quantity;
    private Double price;
    private String imageUrl;
}
