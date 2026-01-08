package com.lifeevent.lid.wishlist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la wishlist
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistDto {
    
    private Long id;
    
    private Long articleId;
    
    private String articleName;
    
    private String articleImage;
    
    private Double price;
    
    private Boolean isFlashSale;
    
    private Boolean isFeatured;
}
