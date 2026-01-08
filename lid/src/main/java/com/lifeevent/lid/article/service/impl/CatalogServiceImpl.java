package com.lifeevent.lid.article.service.impl;

import com.lifeevent.lid.article.dto.ArticleCatalogDto;
import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.mapper.ArticleMapper;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.article.service.CatalogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class CatalogServiceImpl implements CatalogService {
    
    private final ArticleRepository articleRepository;
    private final ArticleMapper articleMapper;
    
    @Override
    public Page<ArticleCatalogDto> getFeaturedArticles(int page, int size) {
        log.info("Récupération des articles featured page {} size {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        
        return articleRepository.findFeaturedArticles().stream()
            .skip((long) page * size)
            .limit(size)
            .map(this::mapToCatalogDto)
            .collect(Collectors.toList())
            .stream()
            .collect(Collectors.collectingAndThen(
                Collectors.toList(),
                list -> new PageImpl<>(list, pageable, list.size())
            ));
    }
    
    @Override
    public Page<ArticleCatalogDto> getBestSellers(int page, int size) {
        log.info("Récupération des bestsellers page {} size {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        
        return articleRepository.findBestSellers().stream()
            .skip((long) page * size)
            .limit(size)
            .map(this::mapToCatalogDto)
            .collect(Collectors.toList())
            .stream()
            .collect(Collectors.collectingAndThen(
                Collectors.toList(),
                list -> new PageImpl<>(list, pageable, list.size())
            ));
    }
    
    @Override
    public Page<ArticleCatalogDto> getFlashSales(int page, int size) {
        log.info("Récupération des ventes flash page {} size {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        
        return articleRepository.findFlashSales(LocalDateTime.now()).stream()
            .skip((long) page * size)
            .limit(size)
            .map(this::mapToCatalogDto)
            .collect(Collectors.toList())
            .stream()
            .collect(Collectors.collectingAndThen(
                Collectors.toList(),
                list -> new PageImpl<>(list, pageable, list.size())
            ));
    }
    
    @Override
    public Page<ArticleCatalogDto> getNewArticles(int page, int size) {
        log.info("Récupération des nouveautés page {} size {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        
        return articleRepository.findNewArticles(pageable)
            .map(this::mapToCatalogDto);
    }
    
    @Override
    public Page<ArticleCatalogDto> search(String name, Integer categoryId, Double minPrice, Double maxPrice, 
                                           Boolean featured, Boolean flashSale, Boolean bestSeller, int page, int size) {
        log.info("Recherche: name={}, category={}, price={}-{}, featured={}, flashSale={}, bestSeller={}",
            name, categoryId, minPrice, maxPrice, featured, flashSale, bestSeller);
        
        Pageable pageable = PageRequest.of(page, size);
        
        return articleRepository.findByAdvancedSearchAndStatus(
            name, categoryId, minPrice, maxPrice, ArticleStatus.ACTIVE, pageable
        ).map(this::mapToCatalogDto);
    }
    
    /**
     * Mapper une entité Article vers ArticleCatalogDto
     */
    private ArticleCatalogDto mapToCatalogDto(Article article) {
        return ArticleCatalogDto.builder()
            .id(article.getId())
            .name(article.getName())
            .image(article.getImg())
            .price(article.getPrice())
            .discountPercent(article.getDiscountPercent())
            .brand(article.getBrand())
            .isFlashSale(article.getIsFlashSale())
            .isFeatured(article.getIsFeatured())
            .isBestSeller(article.getIsBestSeller())
            .build();
    }
}
