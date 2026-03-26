package com.lifeevent.lid.backoffice.partner.dto;

import com.lifeevent.lid.backoffice.partner.preference.dto.PartnerPreferencesDto;
import com.lifeevent.lid.catalog.dto.CatalogCategoryDto;

import java.util.List;

public record BackOfficePartnerSettingsCollectionDto(
        BackOfficePartnerSettingsDto settings,
        PartnerPreferencesDto preferences,
        List<CatalogCategoryDto> categories
) {
}
