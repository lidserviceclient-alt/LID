package com.lifeevent.lid.cart.service;

import com.lifeevent.lid.cart.dto.CartDto;

import java.util.Optional;

public interface CartService {
    
    /**
     * Créer un panier pour un client
     */
    CartDto createCart(Integer customerId);
    
    /**
     * Récupérer le panier d'un client
     */
    Optional<CartDto> getCartByCustomerId(Integer customerId);
    
    /**
     * Ajouter un article au panier
     */
    CartDto addArticleToCart(Integer customerId, Long articleId);
    
    /**
     * Retirer un article du panier
     */
    CartDto removeArticleFromCart(Integer customerId, Long articleId);
    
    /**
     * Vider le panier
     */
    void clearCart(Integer customerId);
    
    /**
     * Supprimer un panier
     */
    void deleteCart(Integer cartId);
}
