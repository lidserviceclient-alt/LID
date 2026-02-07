package com.lifeevent.lid.backoffice.product.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkProductDeleteRequest {
    private List<Long> ids;
}
