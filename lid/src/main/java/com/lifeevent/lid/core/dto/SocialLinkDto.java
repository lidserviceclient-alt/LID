package com.lifeevent.lid.core.dto;

public record SocialLinkDto(
        String id,
        String platform,
        String url,
        Integer sortOrder
) {
}

