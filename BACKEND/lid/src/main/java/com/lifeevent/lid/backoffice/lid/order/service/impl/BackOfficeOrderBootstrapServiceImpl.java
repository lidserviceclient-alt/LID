package com.lifeevent.lid.backoffice.lid.order.service.impl;

import com.lifeevent.lid.backoffice.lid.customer.dto.BackOfficeCustomerDto;
import com.lifeevent.lid.backoffice.lid.customer.service.BackOfficeCustomerService;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeOrderCreateBootstrapDto;
import com.lifeevent.lid.backoffice.lid.order.service.BackOfficeOrderBootstrapService;
import com.lifeevent.lid.backoffice.lid.product.dto.BackOfficeProductDto;
import com.lifeevent.lid.backoffice.lid.product.service.BackOfficeProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BackOfficeOrderBootstrapServiceImpl implements BackOfficeOrderBootstrapService {

    private final BackOfficeCustomerService backOfficeCustomerService;
    private final BackOfficeProductService backOfficeProductService;

    @Override
    public BackOfficeOrderCreateBootstrapDto getCreateBootstrap(
            int customersPage,
            int customersSize,
            int productsPage,
            int productsSize
    ) {
        List<BackOfficeCustomerDto> customers = backOfficeCustomerService
                .getAll(PageRequest.of(customersPage, customersSize))
                .getContent();
        List<BackOfficeProductDto> products = backOfficeProductService
                .getAll(PageRequest.of(productsPage, productsSize))
                .getContent();

        return BackOfficeOrderCreateBootstrapDto.builder()
                .customers(customers)
                .products(products)
                .build();
    }
}
