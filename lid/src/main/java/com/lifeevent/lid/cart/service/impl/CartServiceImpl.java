package com.lifeevent.lid.cart.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.cart.dto.CartDto;
import com.lifeevent.lid.cart.entity.Cart;
import com.lifeevent.lid.cart.repository.CartRepository;
import com.lifeevent.lid.cart.service.CartService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.customer.entity.Customer;
import com.lifeevent.lid.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {
    
    private final CartRepository cartRepository;
    private final CustomerRepository customerRepository;
    private final ArticleRepository articleRepository;
    
    @Override
    public CartDto createCart(Integer customerId) {
        log.info("Création d'un panier pour le client: {}", customerId);
        
        Customer customer = customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", "customerId", customerId.toString()));
        
        Cart cart = Cart.builder()
            .customer(customer)
            .articles(new ArrayList<>())
            .build();
        
        Cart saved = cartRepository.save(cart);
        return mapToDto(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<CartDto> getCartByCustomerId(Integer customerId) {
        return cartRepository.findByCustomerId(customerId).map(this::mapToDto);
    }
    
    @Override
    public CartDto addArticleToCart(Integer customerId, Long articleId) {
        log.info("Ajout d'article {} au panier du client {}", articleId, customerId);
        
        Cart cart = cartRepository.findByCustomerId(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart with customerId", "customerId", customerId.toString()));
        
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article", "articleId", articleId.toString()));
        
        if (!cart.getArticles().contains(article)) {
            cart.getArticles().add(article);
            cartRepository.save(cart);
        }
        
        return mapToDto(cart);
    }
    
    @Override
    public CartDto removeArticleFromCart(Integer customerId, Long articleId) {
        log.info("Suppression d'article {} du panier du client {}", articleId, customerId);
        
        Cart cart = cartRepository.findByCustomerId(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart with customer id ", "customerId", customerId.toString()));
        
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article", "articleId", articleId.toString()));
        
        cart.getArticles().remove(article);
        cartRepository.save(cart);
        
        return mapToDto(cart);
    }
    
    @Override
    public void clearCart(Integer customerId) {
        log.info("Vidage du panier du client: {}", customerId);
        
        Cart cart = cartRepository.findByCustomerId(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart with customer id ", "customerId", customerId.toString()));
        
        cart.getArticles().clear();
        cartRepository.save(cart);
    }
    
    @Override
    public void deleteCart(Integer cartId) {
        log.info("Suppression du panier: {}", cartId);
        if (!cartRepository.existsById(cartId)) {
            throw new ResourceNotFoundException("Cart", "cartId", cartId.toString());
        }
        cartRepository.deleteById(cartId);
    }
    
    public CartDto mapToDto(Cart cart) {
        return CartDto.builder()
            .id(cart.getId())
            .customer(null) // Éviter les boucles infinies
            .articles(List.of()) // Éviter les boucles infinies
            .build();
    }
}
