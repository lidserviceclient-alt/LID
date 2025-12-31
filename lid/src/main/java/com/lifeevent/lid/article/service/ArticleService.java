package com.lifeevent.lid.article.service;

import com.lifeevent.lid.article.dto.ArticleDto;
import com.lifeevent.lid.article.dto.CategoryDto;
import com.lifeevent.lid.article.entity.Article;

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
     * Lister tous les articles
     */
    List<ArticleDto> getAllArticles();
    
    /**
     * Recherche par nom
     */
    List<ArticleDto> searchByName(String name);
    
    /**
     * Recherche par catégorie
     */
    List<ArticleDto> getByCategory(Integer categoryId);
    
    /**
     * Recherche par plage de prix
     */
    List<ArticleDto> getByPriceRange(Integer minPrice, Integer maxPrice);
    
    /**
     * Recherche combinée : nom + catégorie
     */
    List<ArticleDto> searchByNameAndCategory(String name, Integer categoryId);
    
    /**
     * Recherche combinée : nom + plage de prix
     */
    List<ArticleDto> searchByNameAndPrice(String name, Integer minPrice, Integer maxPrice);
    
    /**
     * Recherche complète
     */
    List<ArticleDto> advancedSearch(String name, Integer categoryId, Integer minPrice, Integer maxPrice);
    
    /**
     * Mettre à jour un article
     */
    ArticleDto updateArticle(Long id, ArticleDto dto);
    
    /**
     * Supprimer un article
     */
    void deleteArticle(Long id);
    
    /**
     * Ajouter une catégorie à un article
     */
    void addCategoryToArticle(Long articleId, Integer categoryId);
    
    /**
     * Retirer une catégorie d'un article
     */
    void removeCategoryFromArticle(Long articleId, Integer categoryId);
}
