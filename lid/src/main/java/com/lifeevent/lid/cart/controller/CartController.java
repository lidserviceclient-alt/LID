package com.lifeevent.lid.cart.controller;

import com.lifeevent.lid.cart.dto.CartDto;
import com.lifeevent.lid.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {
    
    private final CartService cartService;
    
    /**
     * Créer un panier
     */
    @PostMapping("/customer/{customerId}")
    public ResponseEntity<CartDto> createCart(@PathVariable Integer customerId) {
        CartDto created = cartService.createCart(customerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    /**
     * Récupérer le panier d'un client
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<CartDto> getCart(@PathVariable Integer customerId) {
        Optional<CartDto> cart = cartService.getCartByCustomerId(customerId);
        return cart.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Ajouter un article au panier
     */
    @PostMapping("/{customerId}/articles/{articleId}")
    public ResponseEntity<CartDto> addArticle(
            @PathVariable Integer customerId,
            @PathVariable Long articleId) {
        CartDto updated = cartService.addArticleToCart(customerId, articleId);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Retirer un article du panier
     */
    @DeleteMapping("/{customerId}/articles/{articleId}")
    public ResponseEntity<CartDto> removeArticle(
            @PathVariable Integer customerId,
            @PathVariable Long articleId) {
        CartDto updated = cartService.removeArticleFromCart(customerId, articleId);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Vider le panier
     */
    @DeleteMapping("/customer/{customerId}/clear")
    public ResponseEntity<Void> clearCart(@PathVariable Integer customerId) {
        cartService.clearCart(customerId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Supprimer un panier
     */
    @DeleteMapping("/{cartId}")
    public ResponseEntity<Void> deleteCart(@PathVariable Integer cartId) {
        cartService.deleteCart(cartId);
        return ResponseEntity.noContent().build();
    }
}
