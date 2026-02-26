package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.CatalogProductDto;
import com.lifeevent.lid.core.dto.CatalogProductDetailsDto;
import com.lifeevent.lid.core.service.ProductService;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Locale;

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
            @RequestParam(value = "size", defaultValue = "50") int size,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "sortKey", required = false) String sortKey
    ) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(size, 1), 200);

        Sort sort = Sort.by(Sort.Direction.DESC, "dateCreation");
        String key = sortKey == null ? "" : sortKey.trim().toLowerCase(Locale.ROOT);
        if (key.equals("price-asc")) sort = Sort.by(Sort.Direction.ASC, "prix");
        else if (key.equals("price-desc")) sort = Sort.by(Sort.Direction.DESC, "prix");
        else if (key.equals("newest")) sort = Sort.by(Sort.Direction.DESC, "dateCreation");

        Pageable pageable = PageRequest.of(safePage, safeSize, sort);

        List<String> categoryTokens = null;
        if (category != null && !category.trim().isBlank()) {
            categoryTokens = java.util.Arrays.stream(category.split(","))
                    .map(String::trim)
                    .filter((v) -> !v.isBlank())
                    .toList();
        }

        return productService.searchCatalogProducts(pageable, q, categoryTokens);
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

    @GetMapping("/latest")
    public List<CatalogProductDto> listLatestProducts(
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return productService.listLatestCatalogProducts(limit);
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
