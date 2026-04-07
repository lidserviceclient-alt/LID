package com.lifeevent.lid.cart.repository;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.cart.entity.Cart;
import com.lifeevent.lid.cart.entity.CartArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartArticleRepository extends JpaRepository<CartArticle, Long> {
    
    /**
     * Trouver un CartArticle par cart et article
     */
    Optional<CartArticle> findByCartAndArticle(Cart cart, Article article);

    @Query("""
            SELECT ca FROM CartArticle ca
            WHERE ca.cart = :cart
              AND ca.article = :article
              AND LOWER(COALESCE(ca.color, '')) = LOWER(COALESCE(:color, ''))
              AND LOWER(COALESCE(ca.size, '')) = LOWER(COALESCE(:size, ''))
            """)
    Optional<CartArticle> findByCartAndArticleAndVariant(
            @Param("cart") Cart cart,
            @Param("article") Article article,
            @Param("color") String color,
            @Param("size") String size
    );

    List<CartArticle> findAllByCartAndArticle(Cart cart, Article article);
    
    /**
     * Trouver tous les CartArticles d'un panier
     */
    List<CartArticle> findByCart(Cart cart);
    
    /**
     * Supprimer tous les CartArticles d'un panier
     */
    void deleteByCart(Cart cart);

    void deleteByCart_Customer_UserId(String customerId);
}
