package com.lifeevent.lid.logistics.repository;

import com.lifeevent.lid.logistics.entity.Shipment;
import com.lifeevent.lid.logistics.enumeration.ShipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    @Query("""
        SELECT s
        FROM Shipment s
        WHERE (:status IS NULL OR :status = '' OR s.status = :status)
          AND (:carrier IS NULL OR :carrier = '' OR LOWER(s.carrier) LIKE LOWER(CONCAT('%', :carrier, '%')))
          AND (
            :q IS NULL OR :q = '' OR
            LOWER(s.trackingId) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(s.orderId) LIKE LOWER(CONCAT('%', :q, '%'))
          )
        ORDER BY s.createdAt DESC
    """)
    Page<Shipment> search(
            @Param("status") ShipmentStatus status,
            @Param("carrier") String carrier,
            @Param("q") String q,
            Pageable pageable
    );

    Optional<Shipment> findByOrderId(String orderId);

    Optional<Shipment> findByTrackingIdIgnoreCase(String trackingId);

    long countByStatus(ShipmentStatus status);

    @Query("""
        SELECT COALESCE(AVG(s.cost), 0)
        FROM Shipment s
        WHERE s.createdAt >= :from
    """)
    double avgCostFrom(@Param("from") LocalDateTime from);
}
