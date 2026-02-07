package com.lifeevent.lid.backoffice.customer.service;

import com.lifeevent.lid.backoffice.customer.dto.BackOfficeCustomerDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeCustomerService {
    Page<BackOfficeCustomerDto> getAll(Pageable pageable);
}
