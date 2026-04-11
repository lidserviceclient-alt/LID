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
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    @Query("""
        SELECT s
        FROM Shipment s
        WHERE (:status IS NULL OR :status = '' OR s.status = :status)
          AND (:carrierPattern IS NULL OR LOWER(CAST(s.carrier AS string)) LIKE :carrierPattern)
          AND (
            :queryPattern IS NULL OR
            LOWER(CAST(s.trackingId AS string)) LIKE :queryPattern OR
            LOWER(CAST(s.orderId AS string)) LIKE :queryPattern
          )
    """)
    Page<Shipment> search(
            @Param("status") ShipmentStatus status,
            @Param("carrierPattern") String carrierPattern,
            @Param("queryPattern") String queryPattern,
            Pageable pageable
    );

    @Query("""
        SELECT s
        FROM Shipment s
        WHERE (:statuses IS NULL OR s.status IN :statuses)
          AND (:carrierPattern IS NULL OR LOWER(CAST(s.carrier AS string)) LIKE :carrierPattern)
          AND (
            :queryPattern IS NULL OR
            LOWER(CAST(s.trackingId AS string)) LIKE :queryPattern OR
            LOWER(CAST(s.orderId AS string)) LIKE :queryPattern
          )
    """)
    Page<Shipment> searchByStatuses(
            @Param("statuses") Collection<ShipmentStatus> statuses,
            @Param("carrierPattern") String carrierPattern,
            @Param("queryPattern") String queryPattern,
            Pageable pageable
    );

    Optional<Shipment> findByOrderId(String orderId);

    Optional<Shipment> findByTrackingIdIgnoreCase(String trackingId);

    List<Shipment> findByOrderIdIn(Collection<String> orderIds);

    long countByStatus(ShipmentStatus status);

    List<Shipment> findByStatusAndCreatedAtGreaterThanEqualAndEtaIsNotNullAndDeliveredAtIsNotNull(
            ShipmentStatus status,
            LocalDateTime from
    );

    @Query("""
        SELECT COALESCE(AVG(s.cost), 0)
        FROM Shipment s
        WHERE s.createdAt >= :from
    """)
    double avgCostFrom(@Param("from") LocalDateTime from);
}
