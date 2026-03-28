package com.lifeevent.lid.backoffice.partner.dto;

import com.lifeevent.lid.backoffice.partner.preference.dto.PartnerPreferencesDto;

public record BackOfficePartnerSettingsCollectionDto(
        BackOfficePartnerSettingsDto settings,
        PartnerPreferencesDto preferences
) {
}
