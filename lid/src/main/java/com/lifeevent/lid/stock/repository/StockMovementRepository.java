package com.lifeevent.lid.stock.repository;

import com.lifeevent.lid.stock.entity.StockMovement;
import com.lifeevent.lid.stock.enumeration.StockMovementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @Query("""
        SELECT sm
        FROM StockMovement sm
        JOIN sm.article a
        WHERE (:sku IS NULL OR :sku = '' OR LOWER(CAST(a.sku AS string)) LIKE LOWER(CONCAT('%', :sku, '%')))
          AND (:type IS NULL OR sm.type = :type)
        ORDER BY sm.createdAt DESC
    """)
    Page<StockMovement> search(
            @Param("sku") String sku,
            @Param("type") StockMovementType type,
            Pageable pageable
    );
}
