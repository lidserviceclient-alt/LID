package com.lifeevent.lid.batch.dto;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.stock.entity.Stock;

import java.util.List;

public record ArticleImportAggregate(
        Article article,
        List<Category> categories,
        Stock stock
) {}

