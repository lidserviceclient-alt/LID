package com.lifeevent.lid.backoffice.overview.dto;

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
