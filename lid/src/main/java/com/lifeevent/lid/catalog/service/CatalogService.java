package com.lifeevent.lid.catalog.service;

import com.lifeevent.lid.catalog.dto.ArticleCatalogDto;
import com.lifeevent.lid.catalog.dto.CatalogCategoryDto;
import com.lifeevent.lid.catalog.dto.CatalogProductDetailsDto;
import com.lifeevent.lid.catalog.dto.CatalogProductDto;
import com.lifeevent.lid.catalog.dto.CreateProductReviewRequest;
import com.lifeevent.lid.catalog.dto.ProductReviewDto;
import com.lifeevent.lid.catalog.dto.ProductReviewsResponse;
import com.lifeevent.lid.catalog.dto.ReportProductReviewRequest;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Service pour les opérations de catalogue
 */
public interface CatalogService {
    
    /**
     * Récupérer tous les articles featured (lid choice)
     */
    Page<ArticleCatalogDto> getFeaturedArticles(int page, int size);
    
    /**
     * Récupérer les meilleures ventes
     */
    Page<ArticleCatalogDto> getBestSellers(int page, int size);
    
    /**
     * Récupérer les articles en vente flash
     */
    Page<ArticleCatalogDto> getFlashSales(int page, int size);
    
    /**
     * Récupérer les articles récemment ajoutés
     */
    Page<ArticleCatalogDto> getNewArticles(int page, int size);
    
    /**
     * Recherche avancée avec filtres
     */
    Page<ArticleCatalogDto> search(
        String name,
        Integer categoryId,
        Double minPrice,
        Double maxPrice,
        Boolean featured,
        Boolean flashSale,
        Boolean bestSeller,
        int page,
        int size
    );

    Page<CatalogProductDto> listProducts(int page, int size, String q, String category, String sortKey);

    List<CatalogProductDto> listFeaturedProducts(Integer limit);

    List<CatalogProductDto> listBestSellerProducts(Integer limit);

    List<CatalogProductDto> listLatestProducts(Integer limit);

    CatalogProductDto getProduct(Long id);

    CatalogProductDetailsDto getProductDetails(Long id);

    List<CatalogCategoryDto> listCategories();

    List<CatalogCategoryDto> listFeaturedCategories(Integer limit);

    ProductReviewsResponse listProductReviews(Long productId, int page, int size);

    ProductReviewDto upsertReview(Long productId, CreateProductReviewRequest request);

    void deleteReview(Long reviewId);

    long toggleLike(Long reviewId);

    void reportReview(Long reviewId, ReportProductReviewRequest request);
}
