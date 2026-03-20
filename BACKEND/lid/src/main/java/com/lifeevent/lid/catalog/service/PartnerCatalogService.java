package com.lifeevent.lid.catalog.service;

import com.lifeevent.lid.catalog.dto.PartnerCatalogPartnerDetailsDto;
import com.lifeevent.lid.catalog.dto.PartnerCatalogPartnerDto;
import com.lifeevent.lid.catalog.dto.PartnerCatalogProductDto;
import org.springframework.data.domain.Page;

public interface PartnerCatalogService {

    Page<PartnerCatalogPartnerDto> listPartners(int page, int size, String q);

    PartnerCatalogPartnerDetailsDto getPartnerDetails(String partnerId);

    Page<PartnerCatalogProductDto> listPartnerProducts(String partnerId, int page, int size, String sortKey);
}
