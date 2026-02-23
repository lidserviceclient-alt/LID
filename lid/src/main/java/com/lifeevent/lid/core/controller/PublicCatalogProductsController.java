package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.CatalogProductDto;
import com.lifeevent.lid.core.dto.CatalogProductDetailsDto;
import com.lifeevent.lid.core.service.ProductService;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog/products")
public class PublicCatalogProductsController {

    private final ProductService productService;

    public PublicCatalogProductsController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public Page<CatalogProductDto> listProducts(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(Math.max(size, 1), 500));
        return productService.listCatalogProducts(pageable);
    }

    @GetMapping("/featured")
    public List<CatalogProductDto> listFeaturedProducts(
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return productService.listFeaturedCatalogProducts(limit);
    }

    @GetMapping("/bestsellers")
    public List<CatalogProductDto> listBestSellerProducts(
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return productService.listBestSellerCatalogProducts(limit);
    }

    @GetMapping("/{id}")
    public CatalogProductDto getProduct(@PathVariable String id) {
        return productService.getCatalogProduct(id);
    }

    @GetMapping("/{id}/details")
    public CatalogProductDetailsDto getProductDetails(@PathVariable String id) {
        return productService.getCatalogProductDetails(id);
    }
}
