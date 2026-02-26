package com.lifeevent.lid.core.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AppConfigDto(
        String storeName,
        String contactEmail,
        String contactPhone,
        String city,
        String logoUrl,
        String slogan,
        String activitySector,
        FreeShippingConfigDto freeShipping,
        List<ShippingMethodDto> shippingMethods,
        List<SocialLinkDto> socialLinks,
        LocalDateTime updatedAt
) {
}
