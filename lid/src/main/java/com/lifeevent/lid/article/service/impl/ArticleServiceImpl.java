package com.lifeevent.lid.article.service.impl;

import com.lifeevent.lid.article.dto.ArticleDto;
import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.article.mapper.ArticleMapper;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.article.repository.CategoryRepository;
import com.lifeevent.lid.article.service.ArticleService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
    public List<ArticleDto> getAllArticles() {
        return articleMapper.toDtoList(articleRepository.findAll());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ArticleDto> searchByName(String name) {
        log.info("Recherche d'articles par nom: {}", name);
        return articleMapper.toDtoList(articleRepository.findByNameContainingIgnoreCase(name));
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ArticleDto> getByCategory(Integer categoryId) {
        log.info("Récupération des articles de la catégorie: {}", categoryId);
        return articleMapper.toDtoList(articleRepository.findByCategory(categoryId));
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ArticleDto> getByPriceRange(Integer minPrice, Integer maxPrice) {
        log.info("Recherche d'articles par prix: {} - {}", minPrice, maxPrice);
        return articleMapper.toDtoList(articleRepository.findByPriceRange(minPrice, maxPrice));
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ArticleDto> searchByNameAndCategory(String name, Integer categoryId) {
        log.info("Recherche par nom et catégorie: {} - {}", name, categoryId);
        return articleMapper.toDtoList(articleRepository.findByNameAndCategory(name, categoryId));
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ArticleDto> searchByNameAndPrice(String name, Integer minPrice, Integer maxPrice) {
        log.info("Recherche par nom et prix: {} - {} à {}", name, minPrice, maxPrice);
        return articleMapper.toDtoList(articleRepository.findByNameAndPriceRange(name, minPrice, maxPrice));
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ArticleDto> advancedSearch(String name, Integer categoryId, Integer minPrice, Integer maxPrice) {
        log.info("Recherche avancée: {} - Catégorie: {} - Prix: {} à {}", name, categoryId, minPrice, maxPrice);
        return articleMapper.toDtoList(articleRepository.searchArticles(name, categoryId, minPrice, maxPrice));
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
        log.info("Suppression de l'article: {}", id);
        if (!articleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Article","articleId",id.toString());
        }
        articleRepository.deleteById(id);
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
}
