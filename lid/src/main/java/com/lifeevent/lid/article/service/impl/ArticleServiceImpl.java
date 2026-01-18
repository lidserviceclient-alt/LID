package com.lifeevent.lid.article.service.impl;

import com.lifeevent.lid.article.dto.ArticleDto;
import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.mapper.ArticleMapper;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.article.repository.CategoryRepository;
import com.lifeevent.lid.article.service.ArticleService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ArticleServiceImpl implements ArticleService {
    
    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final ArticleMapper articleMapper;
    
    @Override
    public ArticleDto createArticle(ArticleDto dto) {
        log.info("Création d'un nouvel article: {}", dto.getName());
        Article article = articleMapper.toEntity(dto);
        article.setStatus(ArticleStatus.ACTIVE);
        Article saved = articleRepository.save(article);
        return articleMapper.toDto(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<ArticleDto> getArticleById(Long id) {
        return articleRepository.findById(id).map(articleMapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ArticleDto> getAllArticles(Pageable pageable) {
        log.info("Récupération de tous les articles - Page: {}, Size: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<Article> articles = articleRepository.findByStatus(ArticleStatus.ACTIVE, pageable);
        return articles.map(articleMapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ArticleDto> searchByName(String name, Pageable pageable) {
        log.info("Recherche d'articles par nom: {} - Page: {}, Size: {}", name, pageable.getPageNumber(), pageable.getPageSize());
        Page<Article> articles = articleRepository.findByNameContainingIgnoreCaseAndStatus(name, ArticleStatus.ACTIVE, pageable);
        return articles.map(articleMapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ArticleDto> getByCategory(Integer categoryId, Pageable pageable) {
        log.info("Récupération des articles de la catégorie: {} - Page: {}, Size: {}", categoryId, pageable.getPageNumber(), pageable.getPageSize());
        Page<Article> articles = articleRepository.findByCategoryAndStatus(categoryId, ArticleStatus.ACTIVE, pageable);
        return articles.map(articleMapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ArticleDto> getByPriceRange(Double minPrice, Double maxPrice, Pageable pageable) {
        log.info("Recherche d'articles par prix: {} - {} - Page: {}, Size: {}", minPrice, maxPrice, pageable.getPageNumber(), pageable.getPageSize());
        Page<Article> articles = articleRepository.findByPriceRangeAndStatus(minPrice, maxPrice, ArticleStatus.ACTIVE, pageable);
        return articles.map(articleMapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ArticleDto> searchByNameAndCategory(String name, Integer categoryId, Pageable pageable) {
        log.info("Recherche par nom et catégorie: {} - {} - Page: {}, Size: {}", name, categoryId, pageable.getPageNumber(), pageable.getPageSize());
        Page<Article> articles = articleRepository.findByNameAndCategoryAndStatus(name, categoryId, ArticleStatus.ACTIVE, pageable);
        return articles.map(articleMapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ArticleDto> searchByNameAndPrice(String name, Double minPrice, Double maxPrice, Pageable pageable) {
        log.info("Recherche par nom et prix: {} - {} à {} - Page: {}, Size: {}", name, minPrice, maxPrice, pageable.getPageNumber(), pageable.getPageSize());
        Page<Article> articles = articleRepository.findByNameAndPriceRangeAndStatus(name, minPrice, maxPrice, ArticleStatus.ACTIVE, pageable);
        return articles.map(articleMapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ArticleDto> advancedSearch(String name, Integer categoryId, Double minPrice, Double maxPrice, Pageable pageable) {
        log.info("Recherche avancée: {} - Catégorie: {} - Prix: {} à {} - Page: {}, Size: {}", 
                 name, categoryId, minPrice, maxPrice, pageable.getPageNumber(), pageable.getPageSize());
        Page<Article> articles = articleRepository.findByAdvancedSearchAndStatus(name, categoryId, minPrice, maxPrice, ArticleStatus.ACTIVE, pageable);
        return articles.map(articleMapper::toDto);
    }
    
    @Override
    public ArticleDto updateArticle(Long id, ArticleDto dto) {
        log.info("Mise à jour de l'article: {}", id);
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Article","articleId",id.toString()));
        
        articleMapper.updateEntityFromDto(dto, article);
        Article updated = articleRepository.save(article);
        return articleMapper.toDto(updated);
    }
    
    @Override
    public void deleteArticle(Long id) {
        log.info("Soft delete de l'article: {}", id);
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Article","articleId",id.toString()));
        // Soft delete: changer le statut au lieu de supprimer physiquement
        article.setStatus(ArticleStatus.INACTIVE);
        articleRepository.save(article);
    }

    @Override
    public void deactivateArticle(Long id) {
        log.info("Désactivation de l'article: {}", id);
        deleteArticle(id);  // Utilise la même logique que deleteArticle
    }
    
    @Override
    public void addCategoryToArticle(Long articleId, Integer categoryId) {
        log.info("Ajout de catégorie {} à l'article {}", categoryId, articleId);
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article","articleId",articleId.toString()));
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category","categoryId",categoryId.toString()));
        
        if (!article.getCategories().contains(category)) {
            article.getCategories().add(category);
            articleRepository.save(article);
        }
    }
    
    @Override
    public void removeCategoryFromArticle(Long articleId, Integer categoryId) {
        log.info("Retrait de catégorie {} de l'article {}", categoryId, articleId);
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article","articleId",articleId.toString()));
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category","categoryId",categoryId.toString()));
        
        article.getCategories().remove(category);
        articleRepository.save(article);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isOwnedByCurrentUser(Long articleId) {
        log.debug("Vérification de ownership pour l'article: {}", articleId);
        String currentUserId = SecurityUtils.getCurrentUserId();
        
        if (currentUserId == null) {
            log.warn("Tentative de vérification d'ownership sans utilisateur authentifié");
            return false;
        }
        
        return articleRepository.findById(articleId)
            .map(article -> currentUserId.equals(article.getReferencePartner()))
            .orElse(false);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ArticleDto> getArticlesByCurrentPartner(Pageable pageable) {
        log.info("Récupération des articles du partenaire courant - Page: {}, Size: {}", pageable.getPageNumber(), pageable.getPageSize());
        String currentPartnerId = SecurityUtils.getCurrentUserId();
        
        if (currentPartnerId == null) {
            log.warn("Tentative de récupération des articles sans utilisateur authentifié");
            return Page.empty(pageable);
        }
        
        Page<Article> articles = articleRepository.findByReferencePartner(currentPartnerId, pageable);
        return articles.map(articleMapper::toDto);
    }
}
