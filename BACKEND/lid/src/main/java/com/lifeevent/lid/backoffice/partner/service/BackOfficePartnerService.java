package com.lifeevent.lid.backoffice.partner.service;

import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCollectionDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCustomerDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerOrderDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerProductDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerSettingsDto;
import org.springframework.data.domain.Page;

public interface BackOfficePartnerService {

    BackOfficePartnerCollectionDto getMyCollection(int productLimit, int orderLimit, int customerLimit);

    Page<BackOfficePartnerProductDto> getMyProducts(int page, int size);

    Page<BackOfficePartnerOrderDto> getMyOrders(int page, int size);

    Page<BackOfficePartnerCustomerDto> getMyCustomers(int page, int size);

    BackOfficePartnerSettingsDto getMySettings();

    BackOfficePartnerSettingsDto updateMySettings(BackOfficePartnerSettingsDto dto);
}
