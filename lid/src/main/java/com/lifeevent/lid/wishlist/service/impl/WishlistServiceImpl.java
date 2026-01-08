package com.lifeevent.lid.wishlist.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.customer.entity.Customer;
import com.lifeevent.lid.customer.repository.CustomerRepository;
import com.lifeevent.lid.wishlist.dto.WishlistDto;
import com.lifeevent.lid.wishlist.entity.Wishlist;
import com.lifeevent.lid.wishlist.mapper.WishlistMapper;
import com.lifeevent.lid.wishlist.repository.WishlistRepository;
import com.lifeevent.lid.wishlist.service.WishlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class WishlistServiceImpl implements WishlistService {
    
    private final WishlistRepository wishlistRepository;
    private final CustomerRepository customerRepository;
    private final ArticleRepository articleRepository;
    private final WishlistMapper wishlistMapper;
    
    @Override
    @Transactional(readOnly = true)
    public List<WishlistDto> getWishlist(Integer customerId) {
        log.info("Récupération de la wishlist du client: {}", customerId);
        // Vérifier que le client existe
        customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId.toString()));
        
        return wishlistMapper.toDtoList(wishlistRepository.findByCustomerId(customerId));
    }
    
    @Override
    public WishlistDto addToWishlist(Integer customerId, Long articleId) {
        log.info("Ajout de l'article {} à la wishlist du client {}", articleId, customerId);
        
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId.toString()));
        
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article", "id", articleId.toString()));
        
        // Si déjà en wishlist, retourner sans erreur (idempotent)
        return wishlistRepository.findByCustomerIdAndArticleId(customerId, articleId)
            .map(wishlistMapper::toDto)
            .orElseGet(() -> {
                Wishlist wishlist = Wishlist.builder()
                    .customer(customer)
                    .article(article)
                    .build();
                Wishlist saved = wishlistRepository.save(wishlist);
                return wishlistMapper.toDto(saved);
            });
    }
    
    @Override
    public void removeFromWishlist(Integer customerId, Long articleId) {
        log.info("Retrait de l'article {} de la wishlist du client {}", articleId, customerId);
        
        // Vérifier que le client existe
        customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId.toString()));
        
        wishlistRepository.deleteByCustomerIdAndArticleId(customerId, articleId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isInWishlist(Integer customerId, Long articleId) {
        return wishlistRepository.findByCustomerIdAndArticleId(customerId, articleId).isPresent();
    }
}
