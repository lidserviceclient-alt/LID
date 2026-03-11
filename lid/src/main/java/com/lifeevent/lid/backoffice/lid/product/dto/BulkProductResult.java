package com.lifeevent.lid.backoffice.lid.product.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkProductResult {
    private int total;
    private int created;
    private List<BulkProductResultItem> results;
}
