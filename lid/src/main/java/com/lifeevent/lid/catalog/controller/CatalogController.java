package com.lifeevent.lid.catalog.controller;

import com.lifeevent.lid.catalog.dto.*;
import com.lifeevent.lid.catalog.service.CatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog")
@RequiredArgsConstructor
public class CatalogController implements ICatalogController {

    private final CatalogService catalogService;

    @GetMapping("/featured")
    @Override
    public Page<ArticleCatalogDto> getFeaturedArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return catalogService.getFeaturedArticles(page, size);
    }

    @GetMapping("/bestsellers")
    @Override
    public Page<ArticleCatalogDto> getBestSellers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return catalogService.getBestSellers(page, size);
    }

    @GetMapping("/flash-sales")
    @Override
    public Page<ArticleCatalogDto> getFlashSales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return catalogService.getFlashSales(page, size);
    }

    @GetMapping("/new")
    @Override
    public Page<ArticleCatalogDto> getNewArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return catalogService.getNewArticles(page, size);
    }

    @GetMapping("/search")
    @Override
    public Page<ArticleCatalogDto> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean flashSale,
            @RequestParam(required = false) Boolean bestSeller,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return catalogService.search(name, categoryId, minPrice, maxPrice, featured, flashSale, bestSeller, page, size);
    }

    @GetMapping("/products")
    @Override
    public Page<CatalogProductDto> listProducts(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "sortKey", required = false) String sortKey
    ) {
        return catalogService.listProducts(page, size, q, category, sortKey);
    }

    @GetMapping("/products/featured")
    @Override
    public List<CatalogProductDto> listFeaturedProducts(
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return catalogService.listFeaturedProducts(limit);
    }

    @GetMapping("/products/bestsellers")
    @Override
    public List<CatalogProductDto> listBestSellerProducts(
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return catalogService.listBestSellerProducts(limit);
    }

    @GetMapping("/products/latest")
    @Override
    public List<CatalogProductDto> listLatestProducts(
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return catalogService.listLatestProducts(limit);
    }

    @GetMapping("/products/{id}")
    @Override
    public CatalogProductDto getProduct(@PathVariable Long id) {
        return catalogService.getProduct(id);
    }

    @GetMapping("/products/{id}/details")
    @Override
    public CatalogProductDetailsDto getProductDetails(@PathVariable Long id) {
        return catalogService.getProductDetails(id);
    }

    @GetMapping("/categories")
    @Override
    public List<CatalogCategoryDto> listCategories() {
        return catalogService.listCategories();
    }

    @GetMapping("/categories/featured")
    @Override
    public List<CatalogCategoryDto> listFeaturedCategories(
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return catalogService.listFeaturedCategories(limit);
    }

    @GetMapping("/products/{productId}/reviews")
    @Override
    public ProductReviewsResponse listReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return catalogService.listProductReviews(productId, page, size);
    }

    @PostMapping("/products/{productId}/reviews")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SUPER_ADMIN')")
    @Override
    public ProductReviewDto upsertReview(
            @PathVariable Long productId,
            @Valid @RequestBody CreateProductReviewRequest request
    ) {
        return catalogService.upsertReview(productId, request);
    }

    @DeleteMapping("/reviews/{reviewId}")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SUPER_ADMIN')")
    @Override
    public void deleteReview(@PathVariable Long reviewId) {
        catalogService.deleteReview(reviewId);
    }

    @PostMapping("/reviews/{reviewId}/like")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SUPER_ADMIN')")
    @Override
    public long likeReview(@PathVariable Long reviewId) {
        return catalogService.toggleLike(reviewId);
    }

    @PostMapping("/reviews/{reviewId}/report")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SUPER_ADMIN')")
    @Override
    public void reportReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReportProductReviewRequest request
    ) {
        catalogService.reportReview(reviewId, request);
    }
}
