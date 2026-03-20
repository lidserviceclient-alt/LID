package com.lifeevent.lid.backoffice.partner.dto;

import java.util.List;

public record BackOfficePartnerCollectionDto(
        BackOfficePartnerStatsDto stats,
        List<BackOfficePartnerProductDto> products,
        List<BackOfficePartnerOrderDto> orders,
        List<BackOfficePartnerCustomerDto> customers,
        BackOfficePartnerSettingsDto settings
) {
}
