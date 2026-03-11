package com.lifeevent.lid.backoffice.lid.search.controller;

import com.lifeevent.lid.backoffice.lid.search.dto.BackOfficeSearchBootstrapDto;
import com.lifeevent.lid.backoffice.lid.search.service.BackOfficeSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/backoffice/search", "/api/backoffice/search"})
@RequiredArgsConstructor
public class BackOfficeSearchController implements IBackOfficeSearchController {

    private final BackOfficeSearchService backOfficeSearchService;

    @Override
    public ResponseEntity<BackOfficeSearchBootstrapDto> getBootstrap(
            int productsPage,
            int productsSize,
            int customersPage,
            int customersSize,
            int usersPage,
            int usersSize,
            String usersRole,
            String usersQuery
    ) {
        return ResponseEntity.ok(backOfficeSearchService
                .getBootstrap(productsPage, productsSize, customersPage, customersSize, usersPage, usersSize, usersRole, usersQuery));
    }
}
