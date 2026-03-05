package com.lifeevent.lid.order.repository;

import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.enumeration.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    interface CustomerOrderMetricsView {
        String getCustomerId();
        Long getOrders();
        Double getSpent();
        LocalDateTime getLastOrder();
    }
    
    /**
     * Commandes d'un client avec pagination
     * EntityGraph optimise le chargement du customer sans jointure inutile
     */
    @EntityGraph(attributePaths = {"customer"})
    Page<Order> findByCustomer_UserId(String customerId, Pageable pageable);

    @EntityGraph(attributePaths = {"customer"})
    @Query("""
        SELECT o
        FROM Order o
        WHERE o.customer.userId = :customerId
          AND (:status IS NULL OR o.currentStatus = :status)
        ORDER BY o.createdAt DESC
    """)
    Page<Order> searchByCustomerBackOffice(@Param("customerId") String customerId, @Param("status") Status status, Pageable pageable);
    
    /**
     * Commandes d'un client
     */
    @EntityGraph(attributePaths = {"customer"})
    List<Order> findByCustomer_UserId(String customerId);
    
    /**
     * Commandes par statut
     */
    @EntityGraph(attributePaths = {"articles"})
    List<Order> findByCurrentStatus(Status status);
    
    /**
     * Commandes d'un client par statut
     */
    @Query("SELECT o FROM Order o WHERE o.customer.userId = :customerId AND o.currentStatus = :status")
    @EntityGraph(attributePaths = {"customer"})
    List<Order> findByCustomerAndStatus(@Param("customerId") String customerId, @Param("status") Status status);

    @EntityGraph(attributePaths = {"customer"})
    @Query("""
        SELECT o
        FROM Order o
        JOIN o.customer c
        WHERE (:status IS NULL OR o.currentStatus = :status)
          AND (
            :q IS NULL OR :q = '' OR
            LOWER(CAST(c.firstName AS string)) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(CAST(c.lastName AS string)) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(CAST(c.email AS string)) LIKE LOWER(CONCAT('%', :q, '%'))
          )
        ORDER BY o.createdAt DESC
    """)
    Page<Order> searchBackOffice(@Param("status") Status status, @Param("q") String q, Pageable pageable);

    @Query("""
        SELECT DISTINCT o
        FROM Order o
        LEFT JOIN FETCH o.customer
        LEFT JOIN FETCH o.statusHistory
        WHERE o.id = :id
    """)
    Optional<Order> findWithCustomerAndStatusHistoryById(@Param("id") Long id);

    @Query("""
        SELECT DISTINCT o
        FROM Order o
        LEFT JOIN FETCH o.customer
        LEFT JOIN FETCH o.statusHistory
        WHERE o.trackingNumber = :trackingNumber
    """)
    Optional<Order> findWithCustomerAndStatusHistoryByTrackingNumber(@Param("trackingNumber") String trackingNumber);

    @Query("""
        SELECT DISTINCT o
        FROM Order o
        LEFT JOIN FETCH o.customer
        LEFT JOIN FETCH o.articles a
        LEFT JOIN FETCH a.article
        WHERE o.id = :id
    """)
    Optional<Order> findWithCustomerAndArticlesById(@Param("id") Long id);

    @Query("""
        SELECT o.customer.userId AS customerId,
               COUNT(o) AS orders,
               COALESCE(SUM(o.amount), 0) AS spent,
               MAX(o.createdAt) AS lastOrder
        FROM Order o
        WHERE o.customer.userId IN :customerIds
        GROUP BY o.customer.userId
    """)
    List<CustomerOrderMetricsView> aggregateMetricsByCustomerIds(@Param("customerIds") Collection<String> customerIds);
}
