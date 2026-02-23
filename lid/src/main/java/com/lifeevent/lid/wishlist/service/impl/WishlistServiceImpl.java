package com.lifeevent.lid.wishlist.service.impl;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.core.entity.Produit;
import com.lifeevent.lid.core.repository.ProduitRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import com.lifeevent.lid.wishlist.dto.WishlistDto;
import com.lifeevent.lid.wishlist.entity.Wishlist;
import com.lifeevent.lid.wishlist.mapper.WishlistMapper;
import com.lifeevent.lid.wishlist.repository.WishlistRepository;
import com.lifeevent.lid.wishlist.service.WishlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ProduitRepository produitRepository;
    private final WishlistMapper wishlistMapper;

    @Override
    @Transactional(readOnly = true)
    public List<WishlistDto> getWishlist(String customerId) {
        log.info("Récupération de la wishlist (produits) du client: {}", customerId);
        ensureUserExists(customerId);

        List<Wishlist> entries = wishlistRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        if (entries.isEmpty()) {
            return List.of();
        }

        List<String> productIds = entries.stream()
                .map(Wishlist::getProductId)
                .filter(id -> id != null && !id.isBlank())
                .distinct()
                .toList();

        Map<String, Produit> productsById = produitRepository.findAllById(productIds).stream()
                .collect(java.util.stream.Collectors.toMap(Produit::getId, Function.identity()));

        List<WishlistDto> result = new ArrayList<>();
        for (Wishlist entry : entries) {
            String productId = entry.getProductId();
            Produit produit = productId != null ? productsById.get(productId) : null;
            if (produit == null) continue;
            WishlistDto dto = wishlistMapper.toDto(produit);
            if (dto != null) result.add(dto);
        }
        return result;
    }

    @Override
    public WishlistDto addToWishlist(String customerId, String productId) {
        log.info("Ajout du produit {} à la wishlist du client {}", productId, customerId);
        ensureUserExists(customerId);

        Produit produit = produitRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit", "id", productId));

        wishlistRepository.findByCustomerIdAndProductId(customerId, productId)
                .orElseGet(() -> wishlistRepository.save(Wishlist.builder()
                        .customerId(customerId)
                        .productId(productId)
                        .build()));

        return wishlistMapper.toDto(produit);
    }

    @Override
    public void removeFromWishlist(String customerId, String productId) {
        log.info("Retrait du produit {} de la wishlist du client {}", productId, customerId);
        ensureUserExists(customerId);
        wishlistRepository.deleteByCustomerIdAndProductId(customerId, productId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isInWishlist(String customerId, String productId) {
        ensureUserExists(customerId);
        return wishlistRepository.existsByCustomerIdAndProductId(customerId, productId);
    }

    private void ensureUserExists(String userId) {
        utilisateurRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "id", userId));
    }
}

