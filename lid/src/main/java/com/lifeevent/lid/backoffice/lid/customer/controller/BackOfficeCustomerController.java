package com.lifeevent.lid.backoffice.lid.customer.controller;

import com.lifeevent.lid.backoffice.lid.customer.dto.BackOfficeCustomerDto;
import com.lifeevent.lid.backoffice.lid.customer.service.BackOfficeCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/backoffice/customers", "/api/backoffice/customers"})
@RequiredArgsConstructor
public class BackOfficeCustomerController implements IBackOfficeCustomerController {

    private final BackOfficeCustomerService backOfficeCustomerService;

    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeCustomerDto>> getAll(int page, int size) {
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(backOfficeCustomerService.getAll(PageRequest.of(page, size))));
    }

    @Override
    public ResponseEntity<BackOfficeCustomerDto> create(BackOfficeCustomerDto dto) {
        return ResponseEntity.ok(backOfficeCustomerService.create(dto));
    }
}
