package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.TypeMouvementStock;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateStockMovementRequest {

    private String productId;
    private String sku;

    @NotNull
    private TypeMouvementStock type;

    @Positive
    private Integer quantity;

    @PositiveOrZero
    private Integer newStock;

    private String reference;
}

