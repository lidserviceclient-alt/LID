package com.lifeevent.lid.common.dto;

public record FileUploadResultDto(
        String originalFilename,
        boolean success,
        FileUploadResponseDto file,
        String errorMessage
) {
}
