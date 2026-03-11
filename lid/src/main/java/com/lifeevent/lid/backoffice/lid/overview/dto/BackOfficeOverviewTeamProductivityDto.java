package com.lifeevent.lid.backoffice.lid.overview.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeOverviewTeamProductivityDto {
    private Long tasksCompleted;
    private Long errors;
    private Long activeMembers;
    private String topPerformer;
    private List<BackOfficeOverviewTeamMemberPerformanceDto> performances;
}
