package com.lifeevent.lid.stock.repository;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.stock.entity.Stock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    Page<Stock> findByArticleId(Long articleId, Pageable pageable);

    boolean existsByArticleId(Long articleId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Stock s WHERE s.article.id = :articleId ORDER BY s.id ASC")
    List<Stock> findByArticleIdForUpdate(@Param("articleId") Long articleId);

    @Modifying
    @Query(value = """
        UPDATE stock
        SET quantity_available = quantity_available - :quantity
        WHERE id = (
            SELECT MIN(s.id)
            FROM stock s
            WHERE s.article_id = :articleId
        )
          AND quantity_available >= :quantity
        """, nativeQuery = true)
    int decrementAvailableIfEnough(@Param("articleId") Long articleId, @Param("quantity") int quantity);

    @Modifying
    @Query(value = """
        UPDATE stock
        SET quantity_available = quantity_available - :quantity,
            quantity_reserved = quantity_reserved + :quantity
        WHERE id = (
            SELECT MIN(s.id)
            FROM stock s
            WHERE s.article_id = :articleId
        )
          AND quantity_available >= :quantity
        """, nativeQuery = true)
    int reserveIfEnough(@Param("articleId") Long articleId, @Param("quantity") int quantity);

    @Modifying
    @Query(value = """
        UPDATE stock
        SET quantity_available = quantity_available + :quantity,
            quantity_reserved = quantity_reserved - :quantity
        WHERE id = (
            SELECT MIN(s.id)
            FROM stock s
            WHERE s.article_id = :articleId
        )
          AND quantity_reserved >= :quantity
        """, nativeQuery = true)
    int releaseReserved(@Param("articleId") Long articleId, @Param("quantity") int quantity);

    @Modifying
    @Query(value = """
        UPDATE stock
        SET quantity_reserved = quantity_reserved - :quantity
        WHERE id = (
            SELECT MIN(s.id)
            FROM stock s
            WHERE s.article_id = :articleId
        )
          AND quantity_reserved >= :quantity
        """, nativeQuery = true)
    int consumeReserved(@Param("articleId") Long articleId, @Param("quantity") int quantity);
    
    /**
     * Trouver les stocks expirés (date de péremption avant la date donnée)
     */
    List<Stock> findByBestBeforeBefore(LocalDate date);
}
