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

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * Commandes d'un client avec pagination
     * EntityGraph optimise le chargement du customer sans jointure inutile
     */
    @EntityGraph(attributePaths = {"customer", "articles"})
    Page<Order> findByCustomer_UserId(String customerId, Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "articles"})
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

    @EntityGraph(attributePaths = {"customer", "articles"})
    @Query("""
        SELECT o
        FROM Order o
        JOIN o.customer c
        WHERE (:status IS NULL OR o.currentStatus = :status)
          AND (
            :q IS NULL OR :q = '' OR
            LOWER(c.firstName) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(c.lastName) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(c.email) LIKE LOWER(CONCAT('%', :q, '%'))
          )
        ORDER BY o.createdAt DESC
    """)
    Page<Order> searchBackOffice(@Param("status") Status status, @Param("q") String q, Pageable pageable);
}
