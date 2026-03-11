package com.lifeevent.lid.catalog.controller;

import com.lifeevent.lid.catalog.dto.PartnerCatalogPartnerDetailsDto;
import com.lifeevent.lid.catalog.dto.PartnerCatalogPartnerDto;
import com.lifeevent.lid.catalog.dto.PartnerCatalogProductDto;
import com.lifeevent.lid.catalog.service.PartnerCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/catalog")
public class PartnerCatalogController implements IPartnerCatalogController {

    private final PartnerCatalogService partnerCatalogService;

    @Override
    public Page<PartnerCatalogPartnerDto> listPartners(int page, int size, String q) {
        return partnerCatalogService.listPartners(page, size, q);
    }

    @Override
    public PartnerCatalogPartnerDetailsDto getPartner(String partnerId) {
        return partnerCatalogService.getPartnerDetails(partnerId);
    }

    @Override
    public Page<PartnerCatalogProductDto> listPartnerProducts(String partnerId, int page, int size, String sortKey) {
        return partnerCatalogService.listPartnerProducts(partnerId, page, size, sortKey);
    }
}
