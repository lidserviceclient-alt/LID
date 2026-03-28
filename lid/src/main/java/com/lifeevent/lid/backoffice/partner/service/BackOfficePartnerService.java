package com.lifeevent.lid.backoffice.partner.service;

import com.lifeevent.lid.backoffice.lid.product.dto.BackOfficeProductDto;
import com.lifeevent.lid.backoffice.partner.category.dto.PartnerSubCategoryDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCollectionDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCategoriesCollectionDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCustomerDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerOrderDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerProductDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerSettingsDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerSettingsCollectionDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerStatsDto;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderDetailDto;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderUpdateRequest;
import com.lifeevent.lid.backoffice.partner.preference.dto.PartnerPreferencesDto;
import com.lifeevent.lid.common.dto.PageResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface BackOfficePartnerService {

    BackOfficePartnerCollectionDto getMyCollection(int productLimit, int orderLimit, int customerLimit);

    BackOfficePartnerStatsDto getMyStats();

    PageResponse<BackOfficePartnerProductDto> getMyProducts(int page, int size);

    PageResponse<BackOfficePartnerOrderDto> getMyOrders(int page, int size);

    PageResponse<BackOfficePartnerCustomerDto> getMyCustomers(int page, int size);

    BackOfficePartnerSettingsDto getMySettings();

    BackOfficePartnerSettingsCollectionDto getMySettingsCollection();
    
    BackOfficePartnerCategoriesCollectionDto getMyCategoriesCollection();

    BackOfficePartnerSettingsDto updateMySettings(BackOfficePartnerSettingsDto dto);

    PageResponse<BackOfficeProductDto> getMyProductsCrud(int page, int size);

    BackOfficeProductDto createMyProduct(BackOfficeProductDto dto);

    BackOfficeProductDto getMyProduct(Long id);

    BackOfficeProductDto updateMyProduct(Long id, BackOfficeProductDto dto);

    void deleteMyProduct(Long id);

    PageResponse<BackOfficePartnerOrderDto> listMyOrdersCrud(int page, int size);

    PartnerOrderDetailDto getMyOrder(Long id);

    PartnerOrderDetailDto updateMyOrder(Long id, PartnerOrderUpdateRequest request);

    void cancelMyOrder(Long id, String comment);

    List<PartnerSubCategoryDto> listMyCategories();

    PartnerSubCategoryDto createMyCategory(PartnerSubCategoryDto dto);

    PartnerSubCategoryDto getMyCategory(Long id);

    PartnerSubCategoryDto updateMyCategory(Long id, PartnerSubCategoryDto dto);

    void deleteMyCategory(Long id);

    PartnerPreferencesDto getMyPreferences();

    PartnerPreferencesDto updateMyPreferences(PartnerPreferencesDto dto);
}
