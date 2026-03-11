package com.lifeevent.lid.backoffice.lid.stock.dto;

import com.lifeevent.lid.stock.enumeration.StockMovementType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateStockMovementRequest {
    private Long productId;
    private StockMovementType type;
    private Integer quantity;
    private Integer newStock;
    private String reference;
}
