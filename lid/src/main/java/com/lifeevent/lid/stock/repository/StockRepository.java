package com.lifeevent.lid.stock.repository;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.stock.entity.Stock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    
    /**
     * Trouver les stocks d'un article
     */
    List<Stock> findByArticle(Article article);
    
    /**
     * Trouver les stocks par ID d'article
     */
    List<Stock> findByArticleId(Long articleId);
    
    /**
     * Trouver les stocks expirés (date de péremption avant la date donnée)
     */
    List<Stock> findByBestBeforeBefore(LocalDate date);

    @Query("""
            select coalesce(sum(s.quantityAvailable), 0)
            from ArticleStock s
            where s.article.id = :articleId
            """)
    int sumAvailableByArticleId(@Param("articleId") Long articleId);
}
