package com.lifeevent.lid.backoffice.lid.log.controller;

import com.lifeevent.lid.backoffice.lid.log.dto.BackOfficeLogEntryDto;
import com.lifeevent.lid.backoffice.lid.log.dto.BackOfficeLogPageDto;
import com.lifeevent.lid.backoffice.lid.log.dto.BackOfficeLogPurgeResultDto;
import com.lifeevent.lid.backoffice.lid.log.service.BackOfficeLogService;
import com.lifeevent.lid.common.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
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
    public ResponseEntity<PageResponse<BackOfficeLogEntryDto>> list(
            int page,
            int size,
            String from,
            String to,
            String level,
            String logger,
            String q
    ) {
        BackOfficeLogPageDto logPage = backOfficeLogService.list(page, size, from, to, level, logger, q);
        return ResponseEntity.ok(PageResponse.from(new PageImpl<>(
                logPage.getItems(),
                PageRequest.of(logPage.getPage(), logPage.getSize()),
                logPage.getTotal()
        )));
    }

    @Override
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<BackOfficeLogPurgeResultDto> purge(String before) {
        return ResponseEntity.ok(backOfficeLogService.purge(before));
    }
}
