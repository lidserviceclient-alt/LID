package com.lifeevent.lid.backoffice.partner.preference.dto;

public record PartnerPreferencesDto(
        Integer stockThreshold,
        String websiteUrl,
        String instagramHandle,
        String facebookPage,
        String openingHoursJson
) {
}
