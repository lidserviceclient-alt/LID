package com.lifeevent.lid.backoffice.product.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkProductResultItem {
    private int index;
    private String reference;
    private String name;
    private boolean success;
    private String productId;
    private String errorMessage;
}
