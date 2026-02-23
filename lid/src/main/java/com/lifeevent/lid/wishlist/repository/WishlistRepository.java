package com.lifeevent.lid.wishlist.repository;

import com.lifeevent.lid.wishlist.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    /**
     * Obtenir la wishlist d'un client
     */
    List<Wishlist> findByCustomerIdOrderByCreatedAtDesc(String customerId);
    
    /**
     * Vérifier si un article est dans la wishlist
     */
    Optional<Wishlist> findByCustomerIdAndProductId(String customerId, String productId);
    
    /**
     * Supprimer un article de la wishlist
     */
    void deleteByCustomerIdAndProductId(String customerId, String productId);

    boolean existsByCustomerIdAndProductId(String customerId, String productId);
}
