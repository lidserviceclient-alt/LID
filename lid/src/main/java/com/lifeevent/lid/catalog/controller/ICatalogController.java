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

    @GetMapping("/featured")
    @Operation(summary = "Articles featured")
    Page<ArticleCatalogDto> getFeaturedArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/bestsellers")
    @Operation(summary = "Articles bestsellers")
    Page<ArticleCatalogDto> getBestSellers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/flash-sales")
    @Operation(summary = "Articles flash sales")
    Page<ArticleCatalogDto> getFlashSales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/new")
    @Operation(summary = "Nouveautés")
    Page<ArticleCatalogDto> getNewArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/search")
    @Operation(summary = "Recherche catalogue")
    Page<ArticleCatalogDto> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean flashSale,
            @RequestParam(required = false) Boolean bestSeller,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/products")
    @Operation(summary = "Lister les produits")
    Page<CatalogProductDto> listProducts(
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
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "24") int size,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "sortKey", required = false) String sortKey
    );

    @GetMapping("/layout/collection")
    @Operation(summary = "Collection layout e-commerce (catégories + latest)")
    CatalogLayoutCollectionDto getLayoutCollection(
            @RequestParam(value = "latestLimit", required = false) Integer latestLimit
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

    @GetMapping("/products/{id}")
    @Operation(summary = "Détail produit")
    CatalogProductDto getProduct(@PathVariable String id);

    @GetMapping("/products/{id}/details")
    @Operation(summary = "Détail produit complet")
    CatalogProductDetailsDto getProductDetails(@PathVariable String id);

    @GetMapping("/products/{id}/collection")
    @Operation(summary = "Collection page produit (détail + liés)")
    CatalogProductPageCollectionDto getProductPageCollection(
            @PathVariable String id,
            @RequestParam(value = "relatedLimit", required = false) Integer relatedLimit,
            @RequestParam(value = "sortKey", required = false) String sortKey
    );

    @GetMapping("/categories")
    @Operation(summary = "Lister les catégories")
    List<CatalogCategoryDto> listCategories();

    @GetMapping("/categories/featured")
    @Operation(summary = "Catégories featured")
    List<CatalogCategoryDto> listFeaturedCategories(@RequestParam(value = "limit", required = false) Integer limit);

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
