package com.lifeevent.lid.backoffice.lid.order.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeOrderLineRequest {
    private Long productId;
    private Integer quantity;
}
