package com.lifeevent.lid.backoffice.lid.customer.service;

import com.lifeevent.lid.backoffice.lid.customer.dto.BackOfficeCustomerDto;
import com.lifeevent.lid.backoffice.lid.customer.dto.BackOfficeCustomerCollectionDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeCustomerService {
    BackOfficeCustomerCollectionDto getCollection(int page, int size, String q, String segment);
    Page<BackOfficeCustomerDto> getAll(Pageable pageable);
    BackOfficeCustomerDto create(BackOfficeCustomerDto dto);
}
