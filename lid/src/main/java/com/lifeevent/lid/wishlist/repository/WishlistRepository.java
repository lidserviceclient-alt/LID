package com.lifeevent.lid.wishlist.repository;

import com.lifeevent.lid.wishlist.entity.Wishlist;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    
    /**
     * Obtenir la wishlist d'un client
     */
    @EntityGraph(attributePaths = {"customer", "article"})
    List<Wishlist> findByCustomer_UserId(String customerId);
    
    /**
     * Vérifier si un article est dans la wishlist
     */
    @EntityGraph(attributePaths = {"customer", "article"})
    Optional<Wishlist> findByCustomer_UserIdAndArticleId(String customerId, Long articleId);
    
    /**
     * Supprimer un article de la wishlist
     */
    void deleteByCustomer_UserIdAndArticleId(String customerId, Long articleId);
}
