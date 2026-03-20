package com.lifeevent.lid.backoffice.partner.product.controller;

import com.lifeevent.lid.backoffice.lid.product.dto.BackOfficeProductDto;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "BackOffice - Partner Products", description = "CRUD produits pour le partner connecté")
@SecurityRequirement(name = "Bearer Token")
public interface IBackOfficePartnerProductController {

    @GetMapping
    ResponseEntity<Page<BackOfficeProductDto>> getMyProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @PostMapping
    ResponseEntity<BackOfficeProductDto> createMyProduct(@RequestBody BackOfficeProductDto dto);

    @GetMapping("/{id}")
    ResponseEntity<BackOfficeProductDto> getMyProduct(@PathVariable Long id);

    @PutMapping("/{id}")
    ResponseEntity<BackOfficeProductDto> updateMyProduct(@PathVariable Long id, @RequestBody BackOfficeProductDto dto);

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteMyProduct(@PathVariable Long id);
}

