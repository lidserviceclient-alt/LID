package com.lifeevent.lid.backoffice.lid.product.service;

import com.lifeevent.lid.backoffice.lid.product.dto.BackOfficeProductDto;
import com.lifeevent.lid.backoffice.lid.product.dto.BulkProductDeleteResponse;
import com.lifeevent.lid.backoffice.lid.product.dto.BulkProductResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BackOfficeProductService {
    Page<BackOfficeProductDto> getAll(Pageable pageable);
    BackOfficeProductDto create(BackOfficeProductDto dto);
    BackOfficeProductDto getById(Long id);
    BackOfficeProductDto update(Long id, BackOfficeProductDto dto);
    void delete(Long id);
    BulkProductResult bulkCreate(List<BackOfficeProductDto> dtos);
    BulkProductDeleteResponse bulkDelete(List<Long> ids);
}
