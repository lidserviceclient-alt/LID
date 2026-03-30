package com.lifeevent.lid.backoffice.lid.log.controller;

import com.lifeevent.lid.backoffice.lid.log.dto.BackOfficeLogPageDto;
import com.lifeevent.lid.backoffice.lid.log.dto.BackOfficeLogPurgeResultDto;
import com.lifeevent.lid.backoffice.lid.log.service.BackOfficeLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/backoffice/logs")
@RequiredArgsConstructor
public class BackOfficeLogController implements IBackOfficeLogController {

    private final BackOfficeLogService backOfficeLogService;

    @Override
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<BackOfficeLogPageDto> list(
            int page,
            int size,
            String from,
            String to,
            String level,
            String logger,
            String q
    ) {
        return ResponseEntity.ok(backOfficeLogService.list(page, size, from, to, level, logger, q));
    }

    @Override
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<BackOfficeLogPurgeResultDto> purge(String before) {
        return ResponseEntity.ok(backOfficeLogService.purge(before));
    }
}
