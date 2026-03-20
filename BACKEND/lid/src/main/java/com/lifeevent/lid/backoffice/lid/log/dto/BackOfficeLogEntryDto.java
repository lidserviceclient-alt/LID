package com.lifeevent.lid.backoffice.lid.log.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class BackOfficeLogEntryDto {
    LocalDateTime timestamp;
    String level;
    String logger;
    String message;
    String raw;
}
