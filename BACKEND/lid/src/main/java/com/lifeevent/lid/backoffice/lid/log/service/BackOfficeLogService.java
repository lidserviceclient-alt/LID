package com.lifeevent.lid.backoffice.lid.log.service;

import com.lifeevent.lid.backoffice.lid.log.dto.BackOfficeLogPageDto;
import com.lifeevent.lid.backoffice.lid.log.dto.BackOfficeLogPurgeResultDto;

public interface BackOfficeLogService {
    BackOfficeLogPageDto list(int page, int size, String from, String to, String level, String logger, String q);

    BackOfficeLogPurgeResultDto purge(String before);
}
