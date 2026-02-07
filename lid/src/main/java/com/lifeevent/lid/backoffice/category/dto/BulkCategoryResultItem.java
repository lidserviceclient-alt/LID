package com.lifeevent.lid.backoffice.category.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkCategoryResultItem {
    private int index;
    private String name;
    private boolean success;
    private String errorMessage;
}
