package com.lifeevent.lid.catalog.controller;

import com.lifeevent.lid.catalog.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Catalog", description = "API publique du catalogue")
public interface ICatalogController {

    @GetMapping("/products")
    @Operation(summary = "Lister les produits")
    com.lifeevent.lid.common.dto.PageResponse<CatalogProductDto> listProducts(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "sortKey", required = false) String sortKey
    );

    @GetMapping("/collection")
    @Operation(summary = "Collection catalogue (bootstrap en un appel)")
    CatalogCollectionDto getCollection(
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
    );

    @GetMapping("/products/featured")
    @Operation(summary = "Produits featured")
    List<CatalogProductDto> listFeaturedProducts(@RequestParam(value = "limit", required = false) Integer limit);

    @GetMapping("/products/bestsellers")
    @Operation(summary = "Produits bestsellers")
    List<CatalogProductDto> listBestSellerProducts(@RequestParam(value = "limit", required = false) Integer limit);

    @GetMapping("/products/latest")
    @Operation(summary = "Derniers produits")
    List<CatalogProductDto> listLatestProducts(@RequestParam(value = "limit", required = false) Integer limit);

    @GetMapping("/products/{id}/details")
    @Operation(summary = "Détail produit complet")
    CatalogProductDetailsDto getProductDetails(@PathVariable String id);

    @GetMapping("/products/{id}/collection")
    @Operation(summary = "Collection page produit (détail + liés)")
    CatalogProductPageCollectionDto getProductPageCollection(
            @PathVariable String id,
            @RequestParam(value = "page") int page,
            @RequestParam(value = "size") int size,
            @RequestParam(value = "relatedLimit", required = false) Integer relatedLimit,
            @RequestParam(value = "sortKey", required = false) String sortKey
    );

    @GetMapping("/categories")
    @Operation(summary = "Lister les catégories")
    List<CatalogCategoryDto> listCategories();

    @GetMapping("/categories/featured")
    @Operation(summary = "Catégories featured")
    List<CatalogCategoryDto> listFeaturedCategories(@RequestParam(value = "limit", required = false) Integer limit);

    @GetMapping("/partners")
    @Operation(summary = "Lister les partenaires")
    com.lifeevent.lid.common.dto.PageResponse<PartnerCatalogPartnerDto> listPartners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q
    );

    @GetMapping("/partners/{partnerId}")
    @Operation(summary = "Détail partenaire")
    PartnerCatalogPartnerDetailsDto getPartner(@PathVariable String partnerId);

    @GetMapping("/partners/{partnerId}/collection")
    @Operation(summary = "Collection partenaire (profil + produits)")
    PartnerCatalogPartnerCollectionDto getPartnerCollection(
            @PathVariable String partnerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortKey
    );

    @GetMapping("/partners/{partnerId}/products")
    @Operation(summary = "Produits d'un partenaire")
    com.lifeevent.lid.common.dto.PageResponse<PartnerCatalogProductDto> listPartnerProducts(
            @PathVariable String partnerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortKey
    );

    @GetMapping("/products/{productId}/reviews")
    @Operation(summary = "Lister les avis")
    ProductReviewsResponse listReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    );

    @PostMapping("/products/{productId}/reviews")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Créer / mettre à jour un avis")
    ProductReviewDto upsertReview(
            @PathVariable Long productId,
            @Valid @RequestBody CreateProductReviewRequest request
    );

    @DeleteMapping("/reviews/{reviewId}")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Supprimer un avis")
    void deleteReview(@PathVariable Long reviewId);

    @PostMapping("/reviews/{reviewId}/like")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Like / unlike")
    long likeReview(@PathVariable Long reviewId);

    @PostMapping("/reviews/{reviewId}/report")
    @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN','SUPER_ADMIN')")
    @Operation(summary = "Signaler un avis")
    void reportReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReportProductReviewRequest request
    );
}
