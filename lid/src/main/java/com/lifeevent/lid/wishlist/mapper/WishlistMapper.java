package com.lifeevent.lid.wishlist.mapper;

import com.lifeevent.lid.core.entity.Produit;
import com.lifeevent.lid.core.entity.ProduitImage;
import com.lifeevent.lid.wishlist.dto.WishlistDto;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WishlistMapper {
    
    public WishlistDto toDto(Produit produit) {
        if (produit == null) {
            return null;
        }

        return WishlistDto.builder()
                .id(produit.getId())
                .referenceProduitPartenaire(produit.getReferencePartenaire())
                .name(produit.getNom())
                .image(resolveMainImageUrl(produit))
                .price(produit.getPrix())
                .isFeatured(Boolean.TRUE.equals(produit.getIsFeatured()))
                .isBestSeller(Boolean.TRUE.equals(produit.getIsBestSeller()))
                .build();
    }
    
    public List<WishlistDto> toDtoList(List<Produit> produits) {
        return (produits == null ? List.<Produit>of() : produits).stream()
                .map(this::toDto)
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    private static String resolveMainImageUrl(Produit produit) {
        List<ProduitImage> images = produit.getImages();
        if (images == null || images.isEmpty()) return null;

        ProduitImage principal = null;
        for (ProduitImage img : images) {
            if (img != null && Boolean.TRUE.equals(img.getEstPrincipale())) {
                principal = img;
                break;
            }
        }
        ProduitImage chosen = principal != null ? principal : images.get(0);
        return chosen != null ? chosen.getUrl() : null;
    }
}
