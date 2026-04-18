package com.lifeevent.lid.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.lifeevent.lid.common.enumeration.CommerceItemType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutItemRequestDto {
    private CommerceItemType itemType;
    private Long articleId;
    private Long ticketEventId;
    private String referenceProduitPartenaire;
    private Integer quantity;
}
