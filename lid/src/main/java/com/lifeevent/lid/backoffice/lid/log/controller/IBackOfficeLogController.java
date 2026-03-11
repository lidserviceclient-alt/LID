package com.lifeevent.lid.backoffice.lid.log.controller;

import com.lifeevent.lid.backoffice.lid.log.dto.BackOfficeLogPageDto;
import com.lifeevent.lid.backoffice.lid.log.dto.BackOfficeLogPurgeResultDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "BackOffice - Logs", description = "Consultation et purge des logs applicatifs")
@SecurityRequirement(name = "Bearer Token")
public interface IBackOfficeLogController {

    @GetMapping
    @Operation(summary = "Lister les logs", description = "Retourne les dernières entrées avec filtres standards")
    ResponseEntity<BackOfficeLogPageDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String logger,
            @RequestParam(required = false) String q
    );

    @DeleteMapping
    @Operation(summary = "Purger les logs", description = "Purge totale ou purge avant une date si before est fourni")
    ResponseEntity<BackOfficeLogPurgeResultDto> purge(
            @RequestParam(required = false) String before
    );
}
