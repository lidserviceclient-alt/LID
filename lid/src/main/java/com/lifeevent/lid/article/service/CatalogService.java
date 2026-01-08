package com.lifeevent.lid.article.service;

import com.lifeevent.lid.article.dto.ArticleCatalogDto;
import org.springframework.data.domain.Page;

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
}
