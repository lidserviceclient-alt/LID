package com.lifeevent.lid.backoffice.partner.category.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerSubCategoryDto {
    private Long id;
    private Integer mainCategoryId;
    private String name;
    private String description;
    private Integer productCount;
}
