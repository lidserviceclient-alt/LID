package com.lifeevent.lid.backoffice.search.controller;

import com.lifeevent.lid.backoffice.search.dto.BackOfficeSearchBootstrapDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "BackOffice - Search", description = "API back-office pour les données de bootstrap de recherche")
public interface IBackOfficeSearchController {

    @GetMapping("/bootstrap")
    ResponseEntity<BackOfficeSearchBootstrapDto> getBootstrap(
            @RequestParam(defaultValue = "0") int productsPage,
            @RequestParam(defaultValue = "20") int productsSize,
            @RequestParam(defaultValue = "0") int customersPage,
            @RequestParam(defaultValue = "20") int customersSize,
            @RequestParam(defaultValue = "0") int usersPage,
            @RequestParam(defaultValue = "20") int usersSize,
            @RequestParam(required = false) String usersRole,
            @RequestParam(required = false) String usersQuery
    );
}
