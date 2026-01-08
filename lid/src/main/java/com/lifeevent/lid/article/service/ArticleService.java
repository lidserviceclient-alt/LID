package com.lifeevent.lid.article.service;

import com.lifeevent.lid.article.dto.ArticleDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ArticleService {
    
    /**
     * Créer un article
     */
    ArticleDto createArticle(ArticleDto dto);
    
    /**
     * Récupérer un article par ID
     */
    Optional<ArticleDto> getArticleById(Long id);
    
    /**
     * Lister tous les articles (pagination)
     */
    Page<ArticleDto> getAllArticles(Pageable pageable);
    
    /**
     * Recherche par nom (pagination)
     */
    Page<ArticleDto> searchByName(String name, Pageable pageable);
    
    /**
     * Recherche par catégorie (pagination)
     */
    Page<ArticleDto> getByCategory(Integer categoryId, Pageable pageable);
    
    /**
     * Recherche par plage de prix (pagination)
     */
    Page<ArticleDto> getByPriceRange(Double minPrice, Double maxPrice, Pageable pageable);
    
    /**
     * Recherche combinée : nom + catégorie (pagination)
     */
    Page<ArticleDto> searchByNameAndCategory(String name, Integer categoryId, Pageable pageable);
    
    /**
     * Recherche combinée : nom + plage de prix (pagination)
     */
    Page<ArticleDto> searchByNameAndPrice(String name, Double minPrice, Double maxPrice, Pageable pageable);
    
    /**
     * Recherche complète (pagination)
     */
    Page<ArticleDto> advancedSearch(String name, Integer categoryId, Double minPrice, Double maxPrice, Pageable pageable);
    
    /**
     * Mettre à jour un article
     */
    ArticleDto updateArticle(Long id, ArticleDto dto);
    
    /**
     * Supprimer un article
     */
    void deleteArticle(Long id);
    
    /**
     * Désactiver un article (soft delete)
     */
    void deactivateArticle(Long id);
    
    /**
     * Ajouter une catégorie à un article
     */
    void addCategoryToArticle(Long articleId, Integer categoryId);
    
    /**
     * Retirer une catégorie d'un article
     */
    void removeCategoryFromArticle(Long articleId, Integer categoryId);
}
