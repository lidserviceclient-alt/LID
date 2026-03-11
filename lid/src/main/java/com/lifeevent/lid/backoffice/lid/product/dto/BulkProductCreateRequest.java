package com.lifeevent.lid.backoffice.lid.product.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkProductCreateRequest {
    private List<BackOfficeProductDto> products;
}
