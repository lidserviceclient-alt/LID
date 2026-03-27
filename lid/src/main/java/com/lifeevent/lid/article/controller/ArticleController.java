package com.lifeevent.lid.article.controller;

import com.lifeevent.lid.article.dto.ArticleDto;
import com.lifeevent.lid.article.service.ArticleService;
import com.lifeevent.lid.common.util.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

//@RestController
@RequestMapping("/api/v1/articles")
@RequiredArgsConstructor
public class ArticleController implements IArticleController {
    
    private final ArticleService articleService;

    @Override
    public ResponseEntity<ArticleDto> createArticle(@RequestBody ArticleDto dto) {
        ArticleDto created = articleService.createArticle(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Override
    public ResponseEntity<ArticleDto> getArticle(@PathVariable Long id) {
        Optional<ArticleDto> article = articleService.getArticleById(id);
        return ResponseUtils.getOrNotFound(article, "Article", id.toString());
    }
    
    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<ArticleDto>> getAllArticles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ArticleDto> articles = articleService.getAllArticles(pageable);
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(articles));
    }
    
    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<ArticleDto>> searchByName(String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ArticleDto> articles = articleService.searchByName(name, pageable);
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(articles));
    }
    
    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<ArticleDto>> getByCategory(Integer categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ArticleDto> articles = articleService.getByCategory(categoryId, pageable);
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(articles));
    }
    
    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<ArticleDto>> getByPriceRange(
            Double minPrice,
            Double maxPrice,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ArticleDto> articles = articleService.getByPriceRange(minPrice, maxPrice, pageable);
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(articles));
    }
    
    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<ArticleDto>> searchByNameAndCategory(
            String name,
            Integer categoryId,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ArticleDto> articles = articleService.searchByNameAndCategory(name, categoryId, pageable);
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(articles));
    }
    
    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<ArticleDto>> searchByNameAndPrice(
            String name,
            Double minPrice,
            Double maxPrice,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ArticleDto> articles = articleService.searchByNameAndPrice(name, minPrice, maxPrice, pageable);
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(articles));
    }
    
    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<ArticleDto>> advancedSearch(
            String name,
            Integer categoryId,
            Double minPrice,
            Double maxPrice,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ArticleDto> articles = articleService.advancedSearch(name, categoryId, minPrice, maxPrice, pageable);
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(articles));
    }
    
    @Override
    public ResponseEntity<ArticleDto> updateArticle(
            @PathVariable Long id,
            @RequestBody ArticleDto dto) {
        ArticleDto updated = articleService.updateArticle(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @Override
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }
    
    @Override
    public ResponseEntity<Void> addCategoryToArticle(
            @PathVariable Long articleId,
            @PathVariable Integer categoryId) {
        articleService.addCategoryToArticle(articleId, categoryId);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> deactivateArticle(@PathVariable Long id) {
        articleService.deactivateArticle(id);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<Void> removeCategoryFromArticle(
            @PathVariable Long articleId,
            @PathVariable Integer categoryId) {
        articleService.removeCategoryFromArticle(articleId, categoryId);
        return ResponseEntity.noContent().build();
    }
}
