package com.lifeevent.lid.backoffice.partner.order.controller;

import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerOrderDto;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderDetailDto;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderUpdateRequest;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "BackOffice - Partner Orders", description = "Gestion des commandes pour le partner connecté")
@SecurityRequirement(name = "Bearer Token")
public interface IBackOfficePartnerOrderCrudController {

    @GetMapping
    ResponseEntity<Page<BackOfficePartnerOrderDto>> listMine(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/{id}")
    ResponseEntity<PartnerOrderDetailDto> getMine(@PathVariable Long id);

    @PutMapping("/{id}")
    ResponseEntity<PartnerOrderDetailDto> updateMine(@PathVariable Long id, @RequestBody PartnerOrderUpdateRequest request);

    @DeleteMapping("/{id}")
    ResponseEntity<Void> cancelMine(@PathVariable Long id, @RequestParam(required = false) String comment);
}

