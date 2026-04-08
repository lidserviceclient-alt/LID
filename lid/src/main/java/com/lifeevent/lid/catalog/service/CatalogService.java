package com.lifeevent.lid.catalog.service;

import com.lifeevent.lid.catalog.dto.CatalogCategoryDto;
import com.lifeevent.lid.catalog.dto.CatalogCollectionDto;
import com.lifeevent.lid.catalog.dto.CatalogProductDetailsDto;
import com.lifeevent.lid.catalog.dto.CatalogProductPageCollectionDto;
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
    
    Page<CatalogProductDto> listProducts(int page, int size, String q, String category, String sortKey);

    List<CatalogProductDto> listFeaturedProducts(Integer limit);

    List<CatalogProductDto> listBestSellerProducts(Integer limit);

    List<CatalogProductDto> listLatestProducts(Integer limit);

    CatalogProductDto getProduct(String idOrReference);

    CatalogProductDetailsDto getProductDetails(Long id);
    CatalogProductDetailsDto getProductDetails(String idOrReference);

    List<CatalogCategoryDto> listCategories();

    List<CatalogCategoryDto> listFeaturedCategories(Integer limit);

    ProductReviewsResponse listProductReviews(Long productId, int page, int size);

    ProductReviewDto upsertReview(Long productId, CreateProductReviewRequest request);

    void deleteReview(Long reviewId);

    long toggleLike(Long reviewId);

    void reportReview(Long reviewId, ReportProductReviewRequest request);

    CatalogCollectionDto getCollection(
            Integer featuredLimit,
            Integer bestSellerLimit,
            Integer latestLimit,
            Integer featuredCategoryLimit,
            Integer postsLimit,
            Integer ticketsLimit,
            int partnersPage,
            int partnersSize,
            String partnersQ,
            int page,
            int size,
            String q,
            String category,
            String sortKey
    );

    CatalogProductPageCollectionDto getProductPageCollection(Long id, int page, int size, Integer relatedLimit, String sortKey);
    CatalogProductPageCollectionDto getProductPageCollection(String idOrReference, int page, int size, Integer relatedLimit, String sortKey);
}
