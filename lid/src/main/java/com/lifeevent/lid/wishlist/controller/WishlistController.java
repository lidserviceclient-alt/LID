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
    public ResponseEntity<List<WishlistDto>> getWishlist(Integer customerId) {
        List<WishlistDto> wishlist = wishlistService.getWishlist(customerId);
        return ResponseEntity.ok(wishlist);
    }
    
    @Override
    @PostMapping("/{articleId}")
    public ResponseEntity<WishlistDto> addToWishlist(Long articleId, Integer customerId) {
        WishlistDto added = wishlistService.addToWishlist(customerId, articleId);
        return ResponseEntity.status(HttpStatus.CREATED).body(added);
    }
    
    @Override
    @DeleteMapping("/{articleId}")
    public ResponseEntity<Void> removeFromWishlist(Long articleId, Integer customerId) {
        wishlistService.removeFromWishlist(customerId, articleId);
        return ResponseEntity.noContent().build();
    }
    
    @Override
    @GetMapping("/{articleId}/exists")
    public ResponseEntity<Boolean> isInWishlist(Long articleId, Integer customerId) {
        boolean inWishlist = wishlistService.isInWishlist(customerId, articleId);
        return ResponseEntity.ok(inWishlist);
    }
}
