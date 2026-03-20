package com.lifeevent.lid.backoffice.lid.stock.dto;

import com.lifeevent.lid.stock.enumeration.StockMovementType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeStockMovementDto {
    private Long id;
    private String sku;
    private StockMovementType type;
    private Integer quantity;
    private Integer stockBefore;
    private Integer stockAfter;
    private LocalDateTime createdAt;
    private String reference;
}
