package com.lifeevent.lid.cart.repository;

import com.lifeevent.lid.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    
    /**
     * Trouver le panier d'un client
     */
    Optional<Cart> findByCustomerId(Integer customerId);
    
    /**
     * Vérifier si un client a un panier
     */
    boolean existsByCustomerId(Integer customerId);
}
