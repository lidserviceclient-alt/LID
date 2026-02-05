package com.lifeevent.lid.core.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderLineRequest {

    private String productId;

    @NotNull
    @Positive
    private Integer quantity;

    private BigDecimal unitPrice;
}

