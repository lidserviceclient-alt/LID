package com.lifeevent.lid.backoffice.search.service;

import com.lifeevent.lid.backoffice.search.dto.BackOfficeSearchBootstrapDto;

public interface BackOfficeSearchService {
    BackOfficeSearchBootstrapDto getBootstrap(
            int productsPage,
            int productsSize,
            int customersPage,
            int customersSize,
            int usersPage,
            int usersSize,
            String usersRole,
            String usersQuery
    );
}
