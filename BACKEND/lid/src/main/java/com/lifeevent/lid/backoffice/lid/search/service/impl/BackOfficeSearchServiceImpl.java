package com.lifeevent.lid.backoffice.lid.search.service.impl;

import com.lifeevent.lid.backoffice.lid.customer.dto.BackOfficeCustomerDto;
import com.lifeevent.lid.backoffice.lid.customer.service.BackOfficeCustomerService;
import com.lifeevent.lid.backoffice.lid.product.dto.BackOfficeProductDto;
import com.lifeevent.lid.backoffice.lid.product.service.BackOfficeProductService;
import com.lifeevent.lid.backoffice.lid.search.dto.BackOfficeSearchBootstrapDto;
import com.lifeevent.lid.backoffice.lid.search.service.BackOfficeSearchService;
import com.lifeevent.lid.backoffice.lid.user.dto.BackOfficeUserDto;
import com.lifeevent.lid.backoffice.lid.user.service.BackOfficeUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BackOfficeSearchServiceImpl implements BackOfficeSearchService {

    private final BackOfficeProductService backOfficeProductService;
    private final BackOfficeCustomerService backOfficeCustomerService;
    private final BackOfficeUserService backOfficeUserService;

    @Override
    public BackOfficeSearchBootstrapDto getBootstrap(
            int productsPage,
            int productsSize,
            int customersPage,
            int customersSize,
            int usersPage,
            int usersSize,
            String usersRole,
            String usersQuery
    ) {
        List<BackOfficeProductDto> products = backOfficeProductService
                .getAll(PageRequest.of(productsPage, productsSize))
                .getContent();
        List<BackOfficeCustomerDto> customers = backOfficeCustomerService
                .getAll(PageRequest.of(customersPage, customersSize))
                .getContent();
        List<BackOfficeUserDto> users = backOfficeUserService
                .getAll(PageRequest.of(usersPage, usersSize), usersRole, usersQuery)
                .getContent();

        return BackOfficeSearchBootstrapDto.builder()
                .products(products)
                .customers(customers)
                .users(users)
                .build();
    }
}
