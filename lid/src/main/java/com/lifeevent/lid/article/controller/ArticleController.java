package com.lifeevent.lid.article.controller;

import com.lifeevent.lid.article.dto.ArticleDto;
import com.lifeevent.lid.article.service.ArticleService;
import com.lifeevent.lid.batch.service.BatchService;
import com.lifeevent.lid.common.util.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.BatchStatus;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController implements IArticleController {
    
    private final ArticleService articleService;
    private final BatchService batchService;
    
    @Override
    public ResponseEntity<ArticleDto> createArticle(@RequestBody ArticleDto dto) {
        ArticleDto created = articleService.createArticle(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Override
    public ResponseEntity<String> importArticles(@RequestParam("file") MultipartFile file) {
        BatchStatus status = batchService.launchArticlesImport(file);
        if(status.isUnsuccessful())
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        return ResponseEntity.status(HttpStatus.CREATED).body("SUCCESS");
    }
    
    @Override
    public ResponseEntity<ArticleDto> getArticle(@PathVariable Long id) {
        Optional<ArticleDto> article = articleService.getArticleById(id);
        return ResponseUtils.getOrNotFound(article, "Article", id.toString());
    }
    
    @Override
    public ResponseEntity<List<ArticleDto>> getAllArticles() {
        List<ArticleDto> articles = articleService.getAllArticles();
        return ResponseEntity.ok(articles);
    }
    
    @Override
    public ResponseEntity<List<ArticleDto>> searchByName(@RequestParam String name) {
        List<ArticleDto> articles = articleService.searchByName(name);
        return ResponseEntity.ok(articles);
    }
    
    @Override
    public ResponseEntity<List<ArticleDto>> getByCategory(@PathVariable Integer categoryId) {
        List<ArticleDto> articles = articleService.getByCategory(categoryId);
        return ResponseEntity.ok(articles);
    }
    
    @Override
    public ResponseEntity<List<ArticleDto>> getByPriceRange(
            @RequestParam Integer minPrice,
            @RequestParam Integer maxPrice) {
        List<ArticleDto> articles = articleService.getByPriceRange(minPrice, maxPrice);
        return ResponseEntity.ok(articles);
    }
    
    @Override
    public ResponseEntity<List<ArticleDto>> searchByNameAndCategory(
            @RequestParam String name,
            @RequestParam Integer categoryId) {
        List<ArticleDto> articles = articleService.searchByNameAndCategory(name, categoryId);
        return ResponseEntity.ok(articles);
    }
    
    @Override
    public ResponseEntity<List<ArticleDto>> searchByNameAndPrice(
            @RequestParam String name,
            @RequestParam Integer minPrice,
            @RequestParam Integer maxPrice) {
        List<ArticleDto> articles = articleService.searchByNameAndPrice(name, minPrice, maxPrice);
        return ResponseEntity.ok(articles);
    }
    
    @Override
    public ResponseEntity<List<ArticleDto>> advancedSearch(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice) {
        List<ArticleDto> articles = articleService.advancedSearch(name, categoryId, minPrice, maxPrice);
        return ResponseEntity.ok(articles);
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
    public ResponseEntity<Void> removeCategoryFromArticle(
            @PathVariable Long articleId,
            @PathVariable Integer categoryId) {
        articleService.removeCategoryFromArticle(articleId, categoryId);
        return ResponseEntity.noContent().build();
    }
}
