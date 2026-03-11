package com.lifeevent.lid.catalog.controller;

import com.lifeevent.lid.catalog.dto.PartnerCatalogPartnerDetailsDto;
import com.lifeevent.lid.catalog.dto.PartnerCatalogPartnerDto;
import com.lifeevent.lid.catalog.dto.PartnerCatalogProductDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Partner Catalog", description = "API publique du catalogue partenaires")
public interface IPartnerCatalogController {

    @GetMapping("/partners")
    @Operation(summary = "Lister les partenaires")
    Page<PartnerCatalogPartnerDto> listPartners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q
    );

    @GetMapping("/partners/{partnerId}")
    @Operation(summary = "Détail partenaire")
    PartnerCatalogPartnerDetailsDto getPartner(@PathVariable String partnerId);

    @GetMapping("/partners/{partnerId}/products")
    @Operation(summary = "Produits d'un partenaire")
    Page<PartnerCatalogProductDto> listPartnerProducts(
            @PathVariable String partnerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortKey
    );
}
