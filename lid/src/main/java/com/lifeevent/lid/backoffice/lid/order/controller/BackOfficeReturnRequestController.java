package com.lifeevent.lid.backoffice.lid.order.controller;

import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeReturnRequestDto;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeReturnRequestUpdateDto;
import com.lifeevent.lid.backoffice.lid.order.service.BackOfficeReturnRequestService;
import com.lifeevent.lid.order.enumeration.ReturnRequestStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/backoffice/returns", "/api/backoffice/returns"})
@RequiredArgsConstructor
public class BackOfficeReturnRequestController implements IBackOfficeReturnRequestController {

    private final BackOfficeReturnRequestService backOfficeReturnRequestService;

    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeReturnRequestDto>> getAll(ReturnRequestStatus status, String q, int page, int size) {
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(backOfficeReturnRequestService.getAll(status, q, PageRequest.of(page, size))));
    }

    @Override
    public ResponseEntity<BackOfficeReturnRequestDto> getById(Long id) {
        return ResponseEntity.ok(backOfficeReturnRequestService.getById(id));
    }

    @Override
    public ResponseEntity<BackOfficeReturnRequestDto> updateStatus(Long id, BackOfficeReturnRequestUpdateDto request) {
        return ResponseEntity.ok(backOfficeReturnRequestService.updateStatus(id, request));
    }
}
