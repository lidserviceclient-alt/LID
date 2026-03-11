package com.lifeevent.lid.backoffice.lid.customer.service;

import com.lifeevent.lid.backoffice.lid.customer.dto.BackOfficeCustomerDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeCustomerService {
    Page<BackOfficeCustomerDto> getAll(Pageable pageable);
    BackOfficeCustomerDto create(BackOfficeCustomerDto dto);
}
