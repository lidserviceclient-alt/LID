package com.lifeevent.lid.backoffice.lid.partner.controller;

import com.lifeevent.lid.backoffice.lid.partner.dto.BackOfficePartnerAdminDto;
import com.lifeevent.lid.backoffice.lid.partner.dto.BackOfficePartnerDecisionRequest;
import com.lifeevent.lid.backoffice.lid.partner.dto.BackOfficePartnerTransactionDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerSettingsDto;
import com.lifeevent.lid.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Tag(name = "BackOffice - Partenaires", description = "API back-office pour gérer les partenaires")
public interface IBackOfficePartnerAdminController {

    @GetMapping
    ResponseEntity<PageResponse<BackOfficePartnerAdminDto>> listPartners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status
    );

    @GetMapping("/{partnerId}")
    ResponseEntity<BackOfficePartnerSettingsDto> getPartner(@PathVariable String partnerId);

    @PostMapping("/{partnerId}/approve")
    ResponseEntity<BackOfficePartnerSettingsDto> approvePartner(@PathVariable String partnerId);

    @PostMapping("/{partnerId}/reject")
    ResponseEntity<BackOfficePartnerSettingsDto> rejectPartner(
            @PathVariable String partnerId,
            @RequestBody(required = false) BackOfficePartnerDecisionRequest request
    );

    @GetMapping("/{partnerId}/transactions")
    ResponseEntity<PageResponse<BackOfficePartnerTransactionDto>> getPartnerTransactions(
            @PathVariable String partnerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );
}
