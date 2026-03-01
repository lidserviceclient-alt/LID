package com.lifeevent.lid.backoffice.order.service;

import com.lifeevent.lid.backoffice.order.dto.BackOfficeReturnRequestDto;
import com.lifeevent.lid.backoffice.order.dto.BackOfficeReturnRequestUpdateDto;
import com.lifeevent.lid.order.enumeration.ReturnRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeReturnRequestService {
    Page<BackOfficeReturnRequestDto> getAll(ReturnRequestStatus status, String q, Pageable pageable);

    BackOfficeReturnRequestDto getById(Long id);

    BackOfficeReturnRequestDto updateStatus(Long id, BackOfficeReturnRequestUpdateDto request);
}
