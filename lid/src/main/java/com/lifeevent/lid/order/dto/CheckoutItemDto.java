package com.lifeevent.lid.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutItemDto {
    private Long articleId;
    private String referenceProduitPartenaire;
    private Integer quantity;
}
