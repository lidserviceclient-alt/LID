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
    List<WishlistDto> getWishlist(Integer customerId);
    
    /**
     * Ajouter un article à la wishlist
     */
    WishlistDto addToWishlist(Integer customerId, Long articleId);
    
    /**
     * Retirer un article de la wishlist
     */
    void removeFromWishlist(Integer customerId, Long articleId);
    
    /**
     * Vérifier si un article est en wishlist
     */
    boolean isInWishlist(Integer customerId, Long articleId);
}
