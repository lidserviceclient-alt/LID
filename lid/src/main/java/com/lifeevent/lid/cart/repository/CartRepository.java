package com.lifeevent.lid.cart.repository;

import com.lifeevent.lid.cart.entity.Cart;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    
    /**
     * Trouver le panier d'un client avec chargement du customer
     * Évite la jointure si non nécessaire grâce au LAZY loading
     */
    @EntityGraph(attributePaths = {"customer"})
    Optional<Cart> findByCustomer_userId(String customerId);
    
    /**
     * Vérifier si un client a un panier (requête légère, pas de join)
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Cart c WHERE c.customer.userId = :customerId")
    boolean existsByCustomerId(@Param("customerId") String customerId);
}
