package com.lifeevent.lid.backoffice.lid.log.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BackOfficeLogPurgeResultDto {
    String mode;
    long filesTouched;
    long filesDeleted;
    long freedBytes;
    long remainingBytes;
}
