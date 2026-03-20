package com.lifeevent.lid.backoffice.lid.overview.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeOverviewTopProductDto {
    private String name;
    private String category;
    private Double revenue;
    private String delta;
}
