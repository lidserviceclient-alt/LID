package com.lifeevent.lid.wishlist.service;

import com.lifeevent.lid.wishlist.dto.WishlistDto;

import java.util.List;

/**
 * Service pour gérer la wishlist
 */
public interface WishlistService {
    
    /**
     * Récupérer la wishlist d'un client
     */
    List<WishlistDto> getWishlist(String customerId);
    
    /**
     * Ajouter un article à la wishlist
     */
    WishlistDto addToWishlist(String customerId, Long articleId);
    
    /**
     * Retirer un article de la wishlist
     */
    void removeFromWishlist(String customerId, Long articleId);
    
    /**
     * Vérifier si un article est en wishlist
     */
    boolean isInWishlist(String customerId, Long articleId);
}
