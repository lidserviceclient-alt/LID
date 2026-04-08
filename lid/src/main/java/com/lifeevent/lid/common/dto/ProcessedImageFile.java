package com.lifeevent.lid.common.dto;

public record ProcessedImageFile(
        byte[] bytes,
        String filename,
        String contentType,
        long originalSize
) {
}
