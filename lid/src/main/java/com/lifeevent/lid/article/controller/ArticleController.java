package com.lifeevent.lid.article.controller;

import com.lifeevent.lid.article.dto.ArticleDto;
import com.lifeevent.lid.article.service.ArticleService;
import com.lifeevent.lid.batch.service.BatchService;
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
public class ArticleController {
    
    private final ArticleService articleService;
    private final BatchService batchService;
    
    /**
     * Créer un article
     */
    @PostMapping
    public ResponseEntity<ArticleDto> createArticle(@RequestBody ArticleDto dto) {
        ArticleDto created = articleService.createArticle(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Importer des articles
     */
    @PostMapping("/import")
    public ResponseEntity<String> createArticle(@RequestParam("file") MultipartFile file) {
        BatchStatus status = batchService.launchArticlesImport(file);
        if(status.isUnsuccessful())
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        return ResponseEntity.status(HttpStatus.CREATED).body("SUCCESS");
    }
    
    /**
     * Récupérer un article par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ArticleDto> getArticle(@PathVariable Long id) {
        Optional<ArticleDto> article = articleService.getArticleById(id);
        return article.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Lister tous les articles
     */
    @GetMapping
    public ResponseEntity<List<ArticleDto>> getAllArticles() {
        List<ArticleDto> articles = articleService.getAllArticles();
        return ResponseEntity.ok(articles);
    }
    
    /**
     * Recherche par nom
     */
    @GetMapping("/search/name")
    public ResponseEntity<List<ArticleDto>> searchByName(@RequestParam String name) {
        List<ArticleDto> articles = articleService.searchByName(name);
        return ResponseEntity.ok(articles);
    }
    
    /**
     * Recherche par catégorie
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ArticleDto>> getByCategory(@PathVariable Integer categoryId) {
        List<ArticleDto> articles = articleService.getByCategory(categoryId);
        return ResponseEntity.ok(articles);
    }
    
    /**
     * Recherche par plage de prix
     */
    @GetMapping("/search/price")
    public ResponseEntity<List<ArticleDto>> getByPriceRange(
            @RequestParam Integer minPrice,
            @RequestParam Integer maxPrice) {
        List<ArticleDto> articles = articleService.getByPriceRange(minPrice, maxPrice);
        return ResponseEntity.ok(articles);
    }
    
    /**
     * Recherche par nom + catégorie
     */
    @GetMapping("/search/name-category")
    public ResponseEntity<List<ArticleDto>> searchByNameAndCategory(
            @RequestParam String name,
            @RequestParam Integer categoryId) {
        List<ArticleDto> articles = articleService.searchByNameAndCategory(name, categoryId);
        return ResponseEntity.ok(articles);
    }
    
    /**
     * Recherche par nom + prix
     */
    @GetMapping("/search/name-price")
    public ResponseEntity<List<ArticleDto>> searchByNameAndPrice(
            @RequestParam String name,
            @RequestParam Integer minPrice,
            @RequestParam Integer maxPrice) {
        List<ArticleDto> articles = articleService.searchByNameAndPrice(name, minPrice, maxPrice);
        return ResponseEntity.ok(articles);
    }
    
    /**
     * Recherche avancée complète
     */
    @GetMapping("/search/advanced")
    public ResponseEntity<List<ArticleDto>> advancedSearch(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice) {
        List<ArticleDto> articles = articleService.advancedSearch(name, categoryId, minPrice, maxPrice);
        return ResponseEntity.ok(articles);
    }
    
    /**
     * Mettre à jour un article
     */
    @PutMapping("/{id}")
    public ResponseEntity<ArticleDto> updateArticle(
            @PathVariable Long id,
            @RequestBody ArticleDto dto) {
        ArticleDto updated = articleService.updateArticle(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Supprimer un article
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Ajouter une catégorie à un article
     */
    @PostMapping("/{articleId}/categories/{categoryId}")
    public ResponseEntity<Void> addCategoryToArticle(
            @PathVariable Long articleId,
            @PathVariable Integer categoryId) {
        articleService.addCategoryToArticle(articleId, categoryId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Retirer une catégorie d'un article
     */
    @DeleteMapping("/{articleId}/categories/{categoryId}")
    public ResponseEntity<Void> removeCategoryFromArticle(
            @PathVariable Long articleId,
            @PathVariable Integer categoryId) {
        articleService.removeCategoryFromArticle(articleId, categoryId);
        return ResponseEntity.noContent().build();
    }
}
