package com.lifeevent.lid.backoffice.lid.overview.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeOverviewTeamActivityItemDto {
    private String name;
    private String role;
    private String action;
    private String time;
}
