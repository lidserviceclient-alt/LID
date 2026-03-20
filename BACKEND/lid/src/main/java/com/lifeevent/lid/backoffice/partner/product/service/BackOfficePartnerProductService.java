package com.lifeevent.lid.backoffice.partner.product.service;

import com.lifeevent.lid.backoffice.lid.product.dto.BackOfficeProductDto;
import org.springframework.data.domain.Page;

public interface BackOfficePartnerProductService {

    Page<BackOfficeProductDto> getMyProducts(int page, int size);

    BackOfficeProductDto createMyProduct(BackOfficeProductDto dto);

    BackOfficeProductDto getMyProduct(Long id);

    BackOfficeProductDto updateMyProduct(Long id, BackOfficeProductDto dto);

    void deleteMyProduct(Long id);
}

