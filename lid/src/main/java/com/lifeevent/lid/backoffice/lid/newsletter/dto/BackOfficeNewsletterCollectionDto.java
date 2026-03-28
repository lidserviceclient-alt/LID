package com.lifeevent.lid.backoffice.lid.newsletter.dto;

import com.lifeevent.lid.common.dto.PageResponse;

public record BackOfficeNewsletterCollectionDto(
        BackOfficeNewsletterStatsDto stats,
        PageResponse<BackOfficeNewsletterSubscriberDto> subscribersPage
) {
}
