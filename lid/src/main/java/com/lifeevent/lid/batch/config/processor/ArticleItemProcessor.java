package com.lifeevent.lid.batch.config.processor;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.batch.dto.ArticleCsvDto;
import com.lifeevent.lid.batch.dto.ArticleImportAggregate;
import com.lifeevent.lid.stock.entity.Stock;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ItemProcessor;

import java.util.Arrays;
import java.util.List;

@Slf4j
public class ArticleItemProcessor implements ItemProcessor<ArticleCsvDto, ArticleImportAggregate> {
    @Override
    public ArticleImportAggregate process(ArticleCsvDto item) {
        if(this.isEmpty(item)) return null;
        Article article = this.processArticle(item);
        List<Category> categories = this.processCategories(item);
        Stock stock = this.processStock(item);

        return new ArticleImportAggregate(
                article,
                categories,
                stock
        );
    }

    public Article processArticle(ArticleCsvDto item){
        if(this.isEmpty(item)) return null;
        final String title = item.getTitle().toUpperCase();
        final Double price = item.getPrice().doubleValue();
        final Article transformedArticle = Article.builder()
                .name(title)
                .price(price)
                .img(item.getImageUrl())
                .ean(item.getReferenceProduitPartenaire())
                .vat(0.18f)
                .build();

        log.info("[transformedArticle] : ( {} ) ", transformedArticle);
        return transformedArticle;
    }

    public List<Category> processCategories(ArticleCsvDto item){
        if(this.isEmpty(item)) return null;
        final List<Category> categories =  Arrays.stream(item.getCategory().split(">")).map(s -> Category.builder()
                .name(s.trim().toUpperCase())
                .orderIdx(1)
                .build()
        ).toList();
        log.info("[transformedCategories] : ( {} ) ", categories);
        return categories;
    }

    public Stock processStock(ArticleCsvDto item){
        if(this.isEmpty(item)) return null;
        final Stock stock = Stock.builder()
                .quantityAvailable(item.getStock())
                .quantityReserved(0)
                .lot(item.getReferenceProduitPartenaire())
                .build();
        log.info("[transformedStock] : ( {} ) ", stock);
        return stock;
    }




    private boolean isEmpty(ArticleCsvDto item) {
        return isBlank(item.getReferencePartenaire())
                && isBlank(item.getReferenceProduitPartenaire())
                && isBlank(item.getTitle())
                && isBlank(item.getDescription())
                && isBlank(item.getCategory())
                && isBlank(item.getBrand())
                && item.getPrice() == null
                && isBlank(item.getCurrency())
                && item.getStock() == null
                && item.getWeightKg() == null
                && isBlank(item.getImageUrl())
                && isBlank(item.getStatus());
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }



}
