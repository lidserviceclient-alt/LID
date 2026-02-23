package com.lifeevent.lid.wishlist.controller;

import com.lifeevent.lid.wishlist.dto.WishlistDto;
import com.lifeevent.lid.wishlist.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class WishlistController implements IWishlistController {
    
    private final WishlistService wishlistService;
    
    @Override
    @GetMapping
    public ResponseEntity<List<WishlistDto>> getWishlist(@RequestParam String customerId) {
        List<WishlistDto> wishlist = wishlistService.getWishlist(customerId);
        return ResponseEntity.ok(wishlist);
    }
    
    @Override
    @PostMapping("/{productId}")
    public ResponseEntity<WishlistDto> addToWishlist(@PathVariable String productId, @RequestParam String customerId) {
        WishlistDto added = wishlistService.addToWishlist(customerId, productId);
        return ResponseEntity.status(HttpStatus.CREATED).body(added);
    }
    
    @Override
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable String productId, @RequestParam String customerId) {
        wishlistService.removeFromWishlist(customerId, productId);
        return ResponseEntity.noContent().build();
    }
    
    @Override
    @GetMapping("/{productId}/exists")
    public ResponseEntity<Boolean> isInWishlist(@PathVariable String productId, @RequestParam String customerId) {
        boolean inWishlist = wishlistService.isInWishlist(customerId, productId);
        return ResponseEntity.ok(inWishlist);
    }
}
