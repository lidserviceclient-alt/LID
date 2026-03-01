package com.lifeevent.lid.backoffice.overview.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeOverviewOrderPipelineStepDto {
    private String label;
    private Long value;
}
