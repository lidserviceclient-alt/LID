package com.lifeevent.lid.catalog.controller;

import com.lifeevent.lid.catalog.dto.*;
import com.lifeevent.lid.catalog.service.CatalogService;
import com.lifeevent.lid.catalog.service.PartnerCatalogService;
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
    private final PartnerCatalogService partnerCatalogService;

    @GetMapping("/featured")
    @Override
    public com.lifeevent.lid.common.dto.PageResponse<ArticleCatalogDto> getFeaturedArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return com.lifeevent.lid.common.dto.PageResponse.from(catalogService.getFeaturedArticles(page, size));
    }

    @GetMapping("/bestsellers")
    @Override
    public com.lifeevent.lid.common.dto.PageResponse<ArticleCatalogDto> getBestSellers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return com.lifeevent.lid.common.dto.PageResponse.from(catalogService.getBestSellers(page, size));
    }

    @GetMapping("/flash-sales")
    @Override
    public com.lifeevent.lid.common.dto.PageResponse<ArticleCatalogDto> getFlashSales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return com.lifeevent.lid.common.dto.PageResponse.from(catalogService.getFlashSales(page, size));
    }

    @GetMapping("/new")
    @Override
    public com.lifeevent.lid.common.dto.PageResponse<ArticleCatalogDto> getNewArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return com.lifeevent.lid.common.dto.PageResponse.from(catalogService.getNewArticles(page, size));
    }

    @GetMapping("/search")
    @Override
    public com.lifeevent.lid.common.dto.PageResponse<ArticleCatalogDto> search(
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
        return com.lifeevent.lid.common.dto.PageResponse.from(catalogService.search(name, categoryId, minPrice, maxPrice, featured, flashSale, bestSeller, page, size));
    }

    @GetMapping("/products")
    @Override
    public com.lifeevent.lid.common.dto.PageResponse<CatalogProductDto> listProducts(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "sortKey", required = false) String sortKey
    ) {
        return com.lifeevent.lid.common.dto.PageResponse.from(catalogService.listProducts(page, size, q, category, sortKey));
    }

    @GetMapping("/collection")
    @Override
    public CatalogCollectionDto getCollection(
            @RequestParam(value = "featuredLimit", required = false) Integer featuredLimit,
            @RequestParam(value = "bestSellerLimit", required = false) Integer bestSellerLimit,
            @RequestParam(value = "latestLimit", required = false) Integer latestLimit,
            @RequestParam(value = "featuredCategoryLimit", required = false) Integer featuredCategoryLimit,
            @RequestParam(value = "postsLimit", required = false) Integer postsLimit,
            @RequestParam(value = "ticketsLimit", required = false) Integer ticketsLimit,
            @RequestParam(value = "partnersPage", defaultValue = "0") int partnersPage,
            @RequestParam(value = "partnersSize", defaultValue = "20") int partnersSize,
            @RequestParam(value = "partnersQ", required = false) String partnersQ,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "24") int size,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "sortKey", required = false) String sortKey
    ) {
        return catalogService.getCollection(
                featuredLimit,
                bestSellerLimit,
                latestLimit,
                featuredCategoryLimit,
                postsLimit,
                ticketsLimit,
                partnersPage,
                partnersSize,
                partnersQ,
                page,
                size,
                q,
                category,
                sortKey
        );
    }

    @GetMapping("/layout/collection")
    @Override
    public CatalogLayoutCollectionDto getLayoutCollection(
            @RequestParam(value = "latestLimit", required = false) Integer latestLimit
    ) {
        return catalogService.getLayoutCollection(latestLimit);
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
    public CatalogProductDto getProduct(@PathVariable String id) {
        return catalogService.getProduct(id);
    }

    @GetMapping("/products/{id}/details")
    @Override
    public CatalogProductDetailsDto getProductDetails(@PathVariable String id) {
        return catalogService.getProductDetails(id);
    }

    @GetMapping("/products/{id}/collection")
    @Override
    public CatalogProductPageCollectionDto getProductPageCollection(
            @PathVariable String id,
            @RequestParam(value = "page") int page,
            @RequestParam(value = "size") int size,
            @RequestParam(value = "relatedLimit", required = false) Integer relatedLimit,
            @RequestParam(value = "sortKey", required = false) String sortKey
    ) {
        return catalogService.getProductPageCollection(id, page, size, relatedLimit, sortKey);
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

    @GetMapping("/partners")
    @Override
    public com.lifeevent.lid.common.dto.PageResponse<PartnerCatalogPartnerDto> listPartners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q
    ) {
        return com.lifeevent.lid.common.dto.PageResponse.from(partnerCatalogService.listPartners(page, size, q));
    }

    @GetMapping("/partners/{partnerId}")
    @Override
    public PartnerCatalogPartnerDetailsDto getPartner(@PathVariable String partnerId) {
        return partnerCatalogService.getPartnerDetails(partnerId);
    }

    @GetMapping("/partners/{partnerId}/collection")
    @Override
    public PartnerCatalogPartnerCollectionDto getPartnerCollection(
            @PathVariable String partnerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortKey
    ) {
        return partnerCatalogService.getPartnerCollection(partnerId, page, size, sortKey);
    }

    @GetMapping("/partners/{partnerId}/products")
    @Override
    public com.lifeevent.lid.common.dto.PageResponse<PartnerCatalogProductDto> listPartnerProducts(
            @PathVariable String partnerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortKey
    ) {
        return com.lifeevent.lid.common.dto.PageResponse.from(partnerCatalogService.listPartnerProducts(partnerId, page, size, sortKey));
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
