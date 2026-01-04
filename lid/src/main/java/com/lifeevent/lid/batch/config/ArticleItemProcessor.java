package com.lifeevent.lid.batch.config;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.batch.dto.ArticleCsvDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ItemProcessor;

/**
 * Processeur pour transformer les articles CSV en entités Article
 */
@Slf4j
public class ArticleItemProcessor implements ItemProcessor<ArticleCsvDto, Article> {

    @Override
    public Article process(ArticleCsvDto item) throws Exception {
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
