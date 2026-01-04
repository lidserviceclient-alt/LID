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
public class CartController implements ICartController {
    
    private final CartService cartService;
    
//    @Override
//    public ResponseEntity<CartDto> createCart(@PathVariable Integer customerId) {
//        CartDto created = cartService.createCart(customerId);
//        return ResponseEntity.status(HttpStatus.CREATED).body(created);
//    }
    
    @Override
    public ResponseEntity<CartDto> getCart(@PathVariable Integer customerId) {
        Optional<CartDto> cart = cartService.getCartByCustomerId(customerId);
        return cart.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @Override
    public ResponseEntity<CartDto> addArticle(
            @PathVariable Integer customerId,
            @PathVariable Long articleId) {
        CartDto updated = cartService.addArticleToCart(customerId, articleId);
        return ResponseEntity.ok(updated);
    }
    
    @Override
    public ResponseEntity<CartDto> removeArticle(
            @PathVariable Integer customerId,
            @PathVariable Long articleId) {
        CartDto updated = cartService.removeArticleFromCart(customerId, articleId);
        return ResponseEntity.ok(updated);
    }
    
    @Override
    public ResponseEntity<Void> clearCart(@PathVariable Integer customerId) {
        cartService.clearCart(customerId);
        return ResponseEntity.noContent().build();
    }
    
    @Override
    public ResponseEntity<Void> deleteCart(@PathVariable Integer cartId) {
        cartService.deleteCart(cartId);
        return ResponseEntity.noContent().build();
    }
}
