package com.lifeevent.lid.backoffice.lid.customer.controller;

import com.lifeevent.lid.backoffice.lid.customer.dto.BackOfficeCustomerDto;
import com.lifeevent.lid.backoffice.lid.customer.dto.BackOfficeCustomerCollectionDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "BackOffice - Clients", description = "API back-office pour gérer les clients")
public interface IBackOfficeCustomerController {

    @GetMapping("/collection")
    ResponseEntity<BackOfficeCustomerCollectionDto> getCollection(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String segment
    );

    @GetMapping
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Lister les clients")
    @ApiResponse(responseCode = "200", description = "Liste paginée des clients")
    ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeCustomerDto>> getAll(
            @Parameter(description = "Page (0..N)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "20") int size
    );

    @PostMapping
    ResponseEntity<BackOfficeCustomerDto> create(@RequestBody BackOfficeCustomerDto dto);
}
