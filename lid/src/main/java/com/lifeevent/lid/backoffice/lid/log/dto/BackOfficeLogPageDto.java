package com.lifeevent.lid.backoffice.lid.log.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class BackOfficeLogPageDto {
    int page;
    int size;
    long total;
    boolean hasMore;
    List<BackOfficeLogEntryDto> items;
}
