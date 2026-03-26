package com.lifeevent.lid.common.dto;

public record FileUploadResponseDto(
        String url,
        String cdnBaseUrl,
        String path,
        String objectKey
) {
}
