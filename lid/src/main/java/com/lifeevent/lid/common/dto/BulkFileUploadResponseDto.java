package com.lifeevent.lid.common.dto;

import java.util.List;

public record BulkFileUploadResponseDto(
        List<FileUploadResultDto> files
) {
}
