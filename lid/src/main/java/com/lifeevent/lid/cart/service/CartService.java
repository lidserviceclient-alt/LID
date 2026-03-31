package com.lifeevent.lid.cart.service;

import com.lifeevent.lid.cart.dto.AddToCartDto;
import com.lifeevent.lid.cart.dto.CartDto;

import java.util.List;
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
     * Ajouter / modifier une ligne panier (article + variante).
     */
    CartDto upsertCartItem(String customerId, AddToCartDto request);
    
    /**
     * Retirer un article du panier
     */
    CartDto removeArticleFromCart(String customerId, Long articleId);

    /**
     * Supprimer une ligne panier (article + variante). Si variante absente, supprime toutes les lignes de l'article.
     */
    CartDto removeArticleFromCart(String customerId, Long articleId, String color, String size);

    /**
     * Synchroniser complètement le panier à partir d'un snapshot frontend.
     */
    CartDto syncCart(String customerId, List<AddToCartDto> items);
    
    /**
     * Vider le panier
     */
    void clearCart(String customerId);
    
    /**
     * Supprimer un panier
     */
    void deleteCart(Integer cartId);
}
