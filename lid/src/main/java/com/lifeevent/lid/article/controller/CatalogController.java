package com.lifeevent.lid.article.controller;

import com.lifeevent.lid.article.dto.ArticleCatalogDto;
import com.lifeevent.lid.article.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/catalog")
@RequiredArgsConstructor
public class CatalogController implements ICatalogController {
    
    private final CatalogService catalogService;
    
    @Override
    @GetMapping("/featured")
    public ResponseEntity<Page<ArticleCatalogDto>> getFeaturedArticles(int page, int size) {
        Page<ArticleCatalogDto> articles = catalogService.getFeaturedArticles(page, size);
        return ResponseEntity.ok(articles);
    }
    
    @Override
    @GetMapping("/bestsellers")
    public ResponseEntity<Page<ArticleCatalogDto>> getBestSellers(int page, int size) {
        Page<ArticleCatalogDto> articles = catalogService.getBestSellers(page, size);
        return ResponseEntity.ok(articles);
    }
    
    @Override
    @GetMapping("/flash-sales")
    public ResponseEntity<Page<ArticleCatalogDto>> getFlashSales(int page, int size) {
        Page<ArticleCatalogDto> articles = catalogService.getFlashSales(page, size);
        return ResponseEntity.ok(articles);
    }
    
    @Override
    @GetMapping("/new")
    public ResponseEntity<Page<ArticleCatalogDto>> getNewArticles(int page, int size) {
        Page<ArticleCatalogDto> articles = catalogService.getNewArticles(page, size);
        return ResponseEntity.ok(articles);
    }
    
    @Override
    @GetMapping("/search")
    public ResponseEntity<Page<ArticleCatalogDto>> search(
            String name,
            Integer categoryId,
            Double minPrice,
            Double maxPrice,
            Boolean featured,
            Boolean flashSale,
            Boolean bestSeller,
            int page,
            int size) {
        Page<ArticleCatalogDto> articles = catalogService.search(
            name, categoryId, minPrice, maxPrice, featured, flashSale, bestSeller, page, size
        );
        return ResponseEntity.ok(articles);
    }
}
