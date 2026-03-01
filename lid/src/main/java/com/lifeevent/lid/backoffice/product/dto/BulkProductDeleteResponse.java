package com.lifeevent.lid.backoffice.product.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkProductDeleteResponse {
    private int requested;
    private int archived;
    private List<String> notFoundIds;
}
