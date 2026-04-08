package com.lifeevent.lid.common.media.dto;

import com.lifeevent.lid.common.media.enumeration.MediaOwnerScope;

import java.time.LocalDateTime;

public record MediaAssetDto(
        Long id,
        MediaOwnerScope ownerScope,
        String ownerUserId,
        String folder,
        String objectKey,
        String url,
        String originalFilename,
        String storedFilename,
        String contentType,
        long originalSize,
        long size,
        LocalDateTime createdAt
) {
}
