package com.lifeevent.lid.backoffice.lid.overview.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeOverviewTeamMemberPerformanceDto {
    private String actor;
    private String name;
    private String role;
    private Long tasksCompleted;
    private Long errors;
    private Double successRate;
    private LocalDateTime lastActiveAt;
}
