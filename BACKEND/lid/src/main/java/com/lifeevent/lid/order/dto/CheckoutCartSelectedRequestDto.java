package com.lifeevent.lid.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CheckoutCartSelectedRequestDto extends CheckoutCartRequestDto {

    /**
     * Commande directe multi-articles (optionnel)
     */
    private List<CheckoutItemRequestDto> articles;
}
