package com.lifeevent.lid.backoffice.lid.overview.dto;

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
