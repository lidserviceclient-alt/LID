package com.lifeevent.lid.cart.controller;

import com.lifeevent.lid.cart.dto.AddToCartDto;
import com.lifeevent.lid.cart.dto.CartDto;
import com.lifeevent.lid.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/carts")
@RequiredArgsConstructor
public class CartController implements ICartController {
    
    private final CartService cartService;
    
//    @Override
//    public ResponseEntity<CartDto> createCart(@PathVariable String customerId) {
//        CartDto created = cartService.createCart(customerId);
//        return ResponseEntity.status(HttpStatus.CREATED).body(created);
//    }
    
    @Override
    public ResponseEntity<CartDto> getCart(@PathVariable String customerId) {
        Optional<CartDto> cart = cartService.getCartByCustomerId(customerId);
        return cart.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @Override
    public ResponseEntity<CartDto> addArticle(
            @PathVariable String customerId,
            @PathVariable Long articleId) {
        CartDto updated = cartService.addArticleToCart(customerId, articleId);
        return ResponseEntity.ok(updated);
    }

    @Override
    public ResponseEntity<CartDto> syncCart(@PathVariable String customerId, @RequestBody List<AddToCartDto> items) {
        return ResponseEntity.ok(cartService.syncCart(customerId, items));
    }

    @Override
    public ResponseEntity<CartDto> upsertItem(@PathVariable String customerId, @PathVariable Long articleId, @RequestBody AddToCartDto item) {
        AddToCartDto payload = item == null ? new AddToCartDto() : item;
        payload.setArticleId(articleId);
        return ResponseEntity.ok(cartService.upsertCartItem(customerId, payload));
    }
    
    @Override
    public ResponseEntity<CartDto> removeArticle(
            @PathVariable String customerId,
            @PathVariable Long articleId,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String size) {
        CartDto updated = cartService.removeArticleFromCart(customerId, articleId, color, size);
        return ResponseEntity.ok(updated);
    }
    
    @Override
    public ResponseEntity<Void> clearCart(@PathVariable String customerId) {
        cartService.clearCart(customerId);
        return ResponseEntity.noContent().build();
    }
    
    @Override
    public ResponseEntity<Void> deleteCart(@PathVariable Integer cartId) {
        cartService.deleteCart(cartId);
        return ResponseEntity.noContent().build();
    }
}
