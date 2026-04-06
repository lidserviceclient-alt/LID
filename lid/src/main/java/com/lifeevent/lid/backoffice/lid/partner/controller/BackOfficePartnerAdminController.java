package com.lifeevent.lid.backoffice.lid.partner.controller;

import com.lifeevent.lid.backoffice.lid.partner.dto.BackOfficePartnerAdminDto;
import com.lifeevent.lid.backoffice.lid.partner.dto.BackOfficePartnerDecisionRequest;
import com.lifeevent.lid.backoffice.lid.partner.service.BackOfficePartnerAdminService;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerSettingsDto;
import com.lifeevent.lid.common.dto.PageResponse;
import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/backoffice/partners")
@RequiredArgsConstructor
public class BackOfficePartnerAdminController implements IBackOfficePartnerAdminController {

    private final BackOfficePartnerAdminService backOfficePartnerAdminService;

    @Override
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PageResponse<BackOfficePartnerAdminDto>> listPartners(int page, int size, String q, String status) {
        return ResponseEntity.ok(backOfficePartnerAdminService.listPartners(page, size, q, parseStatuses(status)));
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficePartnerSettingsDto> getPartner(String partnerId) {
        return ResponseEntity.ok(backOfficePartnerAdminService.getPartner(partnerId));
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficePartnerSettingsDto> approvePartner(String partnerId) {
        return ResponseEntity.ok(backOfficePartnerAdminService.approvePartner(partnerId));
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficePartnerSettingsDto> rejectPartner(String partnerId, BackOfficePartnerDecisionRequest request) {
        String comment = request == null ? null : request.comment();
        return ResponseEntity.ok(backOfficePartnerAdminService.rejectPartner(partnerId, comment));
    }

    private List<PartnerRegistrationStatus> parseStatuses(String raw) {
        if (raw == null) {
            return List.of();
        }
        String trimmed = raw.trim();
        if (trimmed.isEmpty() || "ALL".equalsIgnoreCase(trimmed)) {
            return List.of();
        }
        return Arrays.stream(trimmed.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(value -> {
                    try {
                        return PartnerRegistrationStatus.valueOf(value.toUpperCase());
                    } catch (IllegalArgumentException ignored) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }
}
