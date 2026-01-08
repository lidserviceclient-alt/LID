package com.lifeevent.lid.order.repository;

import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.enumeration.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * Commandes d'un client avec pagination
     */
    Page<Order> findByCustomerId(Integer customerId, Pageable pageable);
    
    /**
     * Commandes d'un client
     */
    List<Order> findByCustomerId(Integer customerId);
    
    /**
     * Commandes par statut
     */
    List<Order> findByCurrentStatus(Status status);
    
    /**
     * Commandes d'un client par statut
     */
    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId AND o.currentStatus = :status")
    List<Order> findByCustomerAndStatus(@Param("customerId") Integer customerId, @Param("status") Status status);
}

