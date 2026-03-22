package com.lifeevent.lid.backoffice.partner.controller;

import com.lifeevent.lid.backoffice.lid.product.dto.BackOfficeProductDto;
import com.lifeevent.lid.backoffice.partner.category.dto.PartnerSubCategoryDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCollectionDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCustomerDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerOrderDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerProductDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerSettingsDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerStatsDto;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderDetailDto;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderUpdateRequest;
import com.lifeevent.lid.backoffice.partner.preference.dto.PartnerPreferencesDto;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "BackOffice - Partner", description = "API back-office partner/seller")
@SecurityRequirement(name = "Bearer Token")
public interface IBackOfficePartnerController {

    @GetMapping("/collection")
    ResponseEntity<BackOfficePartnerCollectionDto> getCollection(
            @RequestParam(defaultValue = "8") int productLimit,
            @RequestParam(defaultValue = "8") int orderLimit,
            @RequestParam(defaultValue = "8") int customerLimit
    );

    @GetMapping("/stats")
    ResponseEntity<BackOfficePartnerStatsDto> getStats();

    @GetMapping("/products")
    ResponseEntity<Page<BackOfficePartnerProductDto>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/orders")
    ResponseEntity<Page<BackOfficePartnerOrderDto>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/customers")
    ResponseEntity<Page<BackOfficePartnerCustomerDto>> getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/settings")
    ResponseEntity<BackOfficePartnerSettingsDto> getSettings();

    @PutMapping("/settings")
    ResponseEntity<BackOfficePartnerSettingsDto> updateSettings(@RequestBody BackOfficePartnerSettingsDto dto);

    @GetMapping("/products-crud")
    ResponseEntity<Page<BackOfficeProductDto>> getProductsCrud(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @PostMapping("/products-crud")
    ResponseEntity<BackOfficeProductDto> createProduct(@RequestBody BackOfficeProductDto dto);

    @GetMapping("/products-crud/{id}")
    ResponseEntity<BackOfficeProductDto> getProduct(@PathVariable Long id);

    @PutMapping("/products-crud/{id}")
    ResponseEntity<BackOfficeProductDto> updateProduct(@PathVariable Long id, @RequestBody BackOfficeProductDto dto);

    @DeleteMapping("/products-crud/{id}")
    ResponseEntity<Void> deleteProduct(@PathVariable Long id);

    @GetMapping("/orders-crud")
    ResponseEntity<Page<BackOfficePartnerOrderDto>> listOrdersCrud(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/orders-crud/{id}")
    ResponseEntity<PartnerOrderDetailDto> getOrder(@PathVariable Long id);

    @PutMapping("/orders-crud/{id}")
    ResponseEntity<PartnerOrderDetailDto> updateOrder(@PathVariable Long id, @RequestBody PartnerOrderUpdateRequest request);

    @DeleteMapping("/orders-crud/{id}")
    ResponseEntity<Void> cancelOrder(@PathVariable Long id, @RequestParam(required = false) String comment);

    @GetMapping("/categories-crud")
    ResponseEntity<List<PartnerSubCategoryDto>> listCategories();

    @PostMapping("/categories-crud")
    ResponseEntity<PartnerSubCategoryDto> createCategory(@RequestBody PartnerSubCategoryDto dto);

    @GetMapping("/categories-crud/{id}")
    ResponseEntity<PartnerSubCategoryDto> getCategory(@PathVariable Long id);

    @PutMapping("/categories-crud/{id}")
    ResponseEntity<PartnerSubCategoryDto> updateCategory(@PathVariable Long id, @RequestBody PartnerSubCategoryDto dto);

    @DeleteMapping("/categories-crud/{id}")
    ResponseEntity<Void> deleteCategory(@PathVariable Long id);

    @GetMapping("/preferences")
    ResponseEntity<PartnerPreferencesDto> getPreferences();

    @PutMapping("/preferences")
    ResponseEntity<PartnerPreferencesDto> updatePreferences(@RequestBody PartnerPreferencesDto dto);
}
