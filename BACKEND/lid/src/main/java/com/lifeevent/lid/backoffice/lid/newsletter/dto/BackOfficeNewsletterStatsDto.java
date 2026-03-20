package com.lifeevent.lid.backoffice.lid.newsletter.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeNewsletterStatsDto {
    private Long total;
    private Long subscribed;
    private Long unsubscribed;
}
