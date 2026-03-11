package com.lifeevent.lid.backoffice.lid.category.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkCategoryCreateRequest {
    private List<BackOfficeCategoryDto> categories;
}
