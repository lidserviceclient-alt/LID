package com.lifeevent.lid.backoffice.lid.partner.dto;

import java.time.LocalDateTime;

public record BackOfficePartnerTransactionScheduleRequest(
        LocalDateTime scheduledAt
) {
}
