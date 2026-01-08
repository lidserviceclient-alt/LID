package com.lifeevent.lid.wishlist.mapper;

import com.lifeevent.lid.wishlist.dto.WishlistDto;
import com.lifeevent.lid.wishlist.entity.Wishlist;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class WishlistMapper {
    
    public WishlistDto toDto(Wishlist entity) {
        if (entity == null) {
            return null;
        }
        
        return WishlistDto.builder()
            .id(entity.getId())
            .articleId(entity.getArticle().getId())
            .articleName(entity.getArticle().getName())
            .articleImage(entity.getArticle().getImg())
            .price(entity.getArticle().getPrice())
            .isFlashSale(entity.getArticle().getIsFlashSale())
            .isFeatured(entity.getArticle().getIsFeatured())
            .build();
    }
    
    public List<WishlistDto> toDtoList(List<Wishlist> entities) {
        return entities.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }
}
