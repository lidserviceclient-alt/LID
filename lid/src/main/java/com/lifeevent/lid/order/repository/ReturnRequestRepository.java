package com.lifeevent.lid.order.repository;

import com.lifeevent.lid.order.entity.ReturnRequest;
import com.lifeevent.lid.order.enumeration.ReturnRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    Page<ReturnRequest> findByStatus(ReturnRequestStatus status, Pageable pageable);

    Page<ReturnRequest> findByOrderNumberContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String orderNumber,
            String email,
            Pageable pageable
    );

    @Query("""
            select r from ReturnRequest r
            where r.status = :status
              and (lower(cast(r.orderNumber as string)) like lower(concat('%', :q, '%'))
                   or lower(cast(r.email as string)) like lower(concat('%', :q, '%')))
            """)
    Page<ReturnRequest> searchByStatusAndQuery(
            @Param("status") ReturnRequestStatus status,
            @Param("q") String q,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "items")
    List<ReturnRequest> findByOrderIdAndStatusIn(Long orderId, Collection<ReturnRequestStatus> statuses);
}
