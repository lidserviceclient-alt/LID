package com.lifeevent.lid.order.repository;

import com.lifeevent.lid.order.entity.OrderArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderArticleRepository extends JpaRepository<OrderArticle, Long> {

    interface ProductRevenueSplitView {
        Long getArticleId();
        Double getCurrentRevenue();
        Double getPreviousRevenue();
    }

    @Query("""
        SELECT oa.article.id AS articleId,
               COALESCE(SUM(
                   CASE WHEN o.createdAt > :pivot
                        THEN (COALESCE(oa.priceAtOrder, 0) * COALESCE(oa.quantity, 0))
                        ELSE 0
                   END
               ), 0) AS currentRevenue,
               COALESCE(SUM(
                   CASE WHEN o.createdAt <= :pivot
                        THEN (COALESCE(oa.priceAtOrder, 0) * COALESCE(oa.quantity, 0))
                        ELSE 0
                   END
               ), 0) AS previousRevenue
        FROM OrderArticle oa
        JOIN oa.order o
        WHERE o.createdAt >= :from
        GROUP BY oa.article.id
    """)
    List<ProductRevenueSplitView> aggregateRevenueSplitByArticleFrom(
            @Param("from") LocalDateTime from,
            @Param("pivot") LocalDateTime pivot
    );
}
