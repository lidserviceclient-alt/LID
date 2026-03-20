package com.lifeevent.lid.backoffice.lid.category.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkCategoryResult {
    private int total;
    private int created;
    private List<BulkCategoryResultItem> results;
}
