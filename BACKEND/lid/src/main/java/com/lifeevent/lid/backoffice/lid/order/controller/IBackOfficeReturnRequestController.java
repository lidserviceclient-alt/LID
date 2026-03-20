package com.lifeevent.lid.backoffice.lid.order.controller;

import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeReturnRequestDto;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeReturnRequestUpdateDto;
import com.lifeevent.lid.order.enumeration.ReturnRequestStatus;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "BackOffice - Returns", description = "API back-office pour gérer les retours")
public interface IBackOfficeReturnRequestController {

    @GetMapping
    ResponseEntity<Page<BackOfficeReturnRequestDto>> getAll(
            @Parameter(description = "Statut") @RequestParam(value = "status", required = false) ReturnRequestStatus status,
            @Parameter(description = "Recherche") @RequestParam(value = "q", required = false) String q,
            @Parameter(description = "Page (0..N)") @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(value = "size", defaultValue = "20") int size
    );

    @GetMapping("/{id}")
    ResponseEntity<BackOfficeReturnRequestDto> getById(
            @Parameter(description = "ID du retour", required = true) @PathVariable Long id
    );

    @PutMapping("/{id}/status")
    ResponseEntity<BackOfficeReturnRequestDto> updateStatus(
            @Parameter(description = "ID du retour", required = true) @PathVariable Long id,
            @RequestBody BackOfficeReturnRequestUpdateDto request
    );
}
