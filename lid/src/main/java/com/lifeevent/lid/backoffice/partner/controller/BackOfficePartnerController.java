package com.lifeevent.lid.backoffice.partner.controller;

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
import com.lifeevent.lid.backoffice.partner.service.BackOfficePartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/backoffice/partners/me")
public class BackOfficePartnerController implements IBackOfficePartnerController {

    private final BackOfficePartnerService backOfficePartnerService;

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficePartnerCollectionDto> getCollection(int productLimit, int orderLimit, int customerLimit) {
        return ResponseEntity.ok(backOfficePartnerService.getMyCollection(productLimit, orderLimit, customerLimit));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficePartnerStatsDto> getStats() {
        return ResponseEntity.ok(backOfficePartnerService.getMyStats());
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficePartnerProductDto>> getProducts(int page, int size) {
        return ResponseEntity.ok(backOfficePartnerService.getMyProducts(page, size));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficePartnerOrderDto>> getOrders(int page, int size) {
        return ResponseEntity.ok(backOfficePartnerService.getMyOrders(page, size));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficePartnerCustomerDto>> getCustomers(int page, int size) {
        return ResponseEntity.ok(backOfficePartnerService.getMyCustomers(page, size));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficePartnerSettingsDto> getSettings() {
        return ResponseEntity.ok(backOfficePartnerService.getMySettings());
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficePartnerSettingsCollectionDto> getSettingsCollection() {
        return ResponseEntity.ok(backOfficePartnerService.getMySettingsCollection());
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficePartnerSettingsDto> updateSettings(BackOfficePartnerSettingsDto dto) {
        return ResponseEntity.ok(backOfficePartnerService.updateMySettings(dto));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeProductDto>> getProductsCrud(int page, int size) {
        return ResponseEntity.ok(backOfficePartnerService.getMyProductsCrud(page, size));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficeProductDto> createProduct(BackOfficeProductDto dto) {
        return ResponseEntity.ok(backOfficePartnerService.createMyProduct(dto));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficeProductDto> getProduct(Long id) {
        return ResponseEntity.ok(backOfficePartnerService.getMyProduct(id));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficeProductDto> updateProduct(Long id, BackOfficeProductDto dto) {
        return ResponseEntity.ok(backOfficePartnerService.updateMyProduct(id, dto));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> deleteProduct(Long id) {
        backOfficePartnerService.deleteMyProduct(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficePartnerOrderDto>> listOrdersCrud(int page, int size) {
        return ResponseEntity.ok(backOfficePartnerService.listMyOrdersCrud(page, size));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PartnerOrderDetailDto> getOrder(Long id) {
        return ResponseEntity.ok(backOfficePartnerService.getMyOrder(id));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PartnerOrderDetailDto> updateOrder(Long id, PartnerOrderUpdateRequest request) {
        return ResponseEntity.ok(backOfficePartnerService.updateMyOrder(id, request));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> cancelOrder(Long id, String comment) {
        backOfficePartnerService.cancelMyOrder(id, comment);
        return ResponseEntity.noContent().build();
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<List<PartnerSubCategoryDto>> listCategories() {
        return ResponseEntity.ok(backOfficePartnerService.listMyCategories());
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<BackOfficePartnerCategoriesCollectionDto> getCategoriesCollection() {
        return ResponseEntity.ok(backOfficePartnerService.getMyCategoriesCollection());
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PartnerSubCategoryDto> createCategory(PartnerSubCategoryDto dto) {
        return ResponseEntity.ok(backOfficePartnerService.createMyCategory(dto));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PartnerSubCategoryDto> getCategory(Long id) {
        return ResponseEntity.ok(backOfficePartnerService.getMyCategory(id));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PartnerSubCategoryDto> updateCategory(Long id, PartnerSubCategoryDto dto) {
        return ResponseEntity.ok(backOfficePartnerService.updateMyCategory(id, dto));
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<Void> deleteCategory(Long id) {
        backOfficePartnerService.deleteMyCategory(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PartnerPreferencesDto> getPreferences() {
        return ResponseEntity.ok(backOfficePartnerService.getMyPreferences());
    }

    @Override
    @PreAuthorize("hasAnyRole('PARTNER','ADMIN','SUPER_ADMIN')")
    public ResponseEntity<PartnerPreferencesDto> updatePreferences(PartnerPreferencesDto dto) {
        return ResponseEntity.ok(backOfficePartnerService.updateMyPreferences(dto));
    }
}
