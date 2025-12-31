package com.lifeevent.lid.article.service.impl;

import com.lifeevent.lid.article.dto.ArticleDto;
import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.entity.Category;
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
    
    @Override
    public ArticleDto createArticle(ArticleDto dto) {
        log.info("Création d'un nouvel article: {}", dto.getName());
        Article article = Article.builder()
            .name(dto.getName())
            .price(dto.getPrice())
            .img(dto.getImg())
            .ean(dto.getEan())
            .vat(dto.getVat())
            .build();
        
        Article saved = articleRepository.save(article);
        return mapToDto(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<ArticleDto> getArticleById(Long id) {
        return articleRepository.findById(id).map(this::mapToDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ArticleDto> getAllArticles() {
        return articleRepository.findAll()
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ArticleDto> searchByName(String name) {
        log.info("Recherche d'articles par nom: {}", name);
        return articleRepository.findByNameContainingIgnoreCase(name)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ArticleDto> getByCategory(Integer categoryId) {
        log.info("Récupération des articles de la catégorie: {}", categoryId);
        return articleRepository.findByCategory(categoryId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ArticleDto> getByPriceRange(Integer minPrice, Integer maxPrice) {
        log.info("Recherche d'articles par prix: {} - {}", minPrice, maxPrice);
        return articleRepository.findByPriceRange(minPrice, maxPrice)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ArticleDto> searchByNameAndCategory(String name, Integer categoryId) {
        log.info("Recherche par nom et catégorie: {} - {}", name, categoryId);
        return articleRepository.findByNameAndCategory(name, categoryId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ArticleDto> searchByNameAndPrice(String name, Integer minPrice, Integer maxPrice) {
        log.info("Recherche par nom et prix: {} - {} à {}", name, minPrice, maxPrice);
        return articleRepository.findByNameAndPriceRange(name, minPrice, maxPrice)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ArticleDto> advancedSearch(String name, Integer categoryId, Integer minPrice, Integer maxPrice) {
        log.info("Recherche avancée: {} - Catégorie: {} - Prix: {} à {}", name, categoryId, minPrice, maxPrice);
        return articleRepository.searchArticles(name, categoryId, minPrice, maxPrice)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    public ArticleDto updateArticle(Long id, ArticleDto dto) {
        log.info("Mise à jour de l'article: {}", id);
        Article article = articleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Article","articleId",id.toString()));
        
        if (dto.getName() != null) article.setName(dto.getName());
        if (dto.getPrice() != null) article.setPrice(dto.getPrice());
        if (dto.getImg() != null) article.setImg(dto.getImg());
        if (dto.getEan() != null) article.setEan(dto.getEan());
        if (dto.getVat() != null) article.setVat(dto.getVat());
        
        Article updated = articleRepository.save(article);
        return mapToDto(updated);
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
    
    private ArticleDto mapToDto(Article article) {
        return ArticleDto.builder()
            .id(article.getId())
            .name(article.getName())
            .price(article.getPrice())
            .img(article.getImg())
            .ean(article.getEan())
            .vat(article.getVat())
            .build();
    }
}
