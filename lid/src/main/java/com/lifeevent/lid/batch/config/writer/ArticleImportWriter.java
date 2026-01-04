package com.lifeevent.lid.batch.config.writer;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.article.repository.CategoryRepository;
import com.lifeevent.lid.batch.dto.ArticleImportAggregate;
import com.lifeevent.lid.stock.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ArticleImportWriter implements ItemWriter<ArticleImportAggregate> {

    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final StockRepository stockRepository;

    @Override
    public void write(Chunk<? extends ArticleImportAggregate> chunk) throws Exception {
        Map<String, Category> categoryCache = new HashMap<>();

        for (ArticleImportAggregate agg : chunk) {

            List<Category> categories = agg.categories().stream()
                    .map(cat -> categoryCache.computeIfAbsent(
                            cat.getName(),
                            name -> saveCategory(cat)
                    ))
                    .toList();

            agg.article().setCategories(categories);

            Article article = articleRepository.save(agg.article());
            agg.stock().setArticle(article);
            stockRepository.save(agg.stock());
        }
    }

    public Category saveCategory(Category category){
        return categoryRepository.findByName(category.getName())
                .orElse(categoryRepository.save(category));
    }
}
