package com.lifeevent.lid.catalog.dto;

public record PartnerCatalogPartnerDto(
        String partnerId,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        Long shopId,
        String shopName,
        String shopDescription,
        String logoUrl,
        String backgroundUrl,
        Integer mainCategoryId,
        String mainCategoryName,
        String city,
        String country
) {
}
