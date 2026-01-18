package com.lifeevent.lid.cart.service;

import com.lifeevent.lid.cart.dto.CartDto;

import java.util.Optional;

public interface CartService {
    
    /**
     * Créer un panier pour un client
     */
    CartDto createCart(String customerId);
    
    /**
     * Récupérer le panier d'un client
     */
    Optional<CartDto> getCartByCustomerId(String customerId);
    
    /**
     * Ajouter un article au panier
     */
    CartDto addArticleToCart(String customerId, Long articleId);
    
    /**
     * Retirer un article du panier
     */
    CartDto removeArticleFromCart(String customerId, Long articleId);
    
    /**
     * Vider le panier
     */
    void clearCart(String customerId);
    
    /**
     * Supprimer un panier
     */
    void deleteCart(Integer cartId);
}
