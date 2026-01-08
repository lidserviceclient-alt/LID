package com.lifeevent.lid.cart.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.mapper.ArticleMapper;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.cart.dto.CartDto;
import com.lifeevent.lid.cart.entity.Cart;
import com.lifeevent.lid.cart.entity.CartArticle;
import com.lifeevent.lid.cart.mapper.CartArticleMapper;
import com.lifeevent.lid.cart.mapper.CartMapper;
import com.lifeevent.lid.cart.repository.CartArticleRepository;
import com.lifeevent.lid.cart.repository.CartRepository;
import com.lifeevent.lid.cart.service.CartService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.customer.entity.Customer;
import com.lifeevent.lid.customer.mapper.CustomerMapper;
import com.lifeevent.lid.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.antlr.v4.runtime.misc.Pair;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {
    
    private final CartRepository cartRepository;
    private final CartArticleRepository cartArticleRepository;
    private final CustomerRepository customerRepository;
    private final ArticleRepository articleRepository;
    private final CartMapper cartMapper;
    private final CartArticleMapper cartArticleMapper;
    private final CustomerMapper customerMapper;
    private final ArticleMapper articleMapper;
    
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
        return mapToDtoWithDetails(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<CartDto> getCartByCustomerId(Integer customerId) {
        return cartRepository.findByCustomerId(customerId).map(this::mapToDtoWithDetails);
    }
    
    @Override
    public CartDto addArticleToCart(Integer customerId, Long articleId) {
        log.info("Ajout d'article {} au panier du client {}", articleId, customerId);
        
        Cart cart = cartRepository.findByCustomerId(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", customerId.toString()));
        
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article", "articleId", articleId.toString()));

        if(ArticleStatus.INACTIVE.equals(article.getStatus()))
                throw new RuntimeException("Article is not available");
        

        CartArticle existingCartArticle = cartArticleRepository.findByCartAndArticle(cart, article)
            .orElse(null);
        
        if (existingCartArticle != null) {
            existingCartArticle.setQuantity(existingCartArticle.getQuantity() + 1);
            cartArticleRepository.save(existingCartArticle);
            log.info("Quantité de l'article {} augmentée à {}", articleId, existingCartArticle.getQuantity());
        } else {
            // Sinon, ajouter une nouvelle ligne de panier
            CartArticle cartArticle = CartArticle.builder()
                .cart(cart)
                .article(article)
                .quantity(1)
                .build();
            cartArticleRepository.save(cartArticle);
            log.info("Article {} ajouté au panier avec quantité 1", articleId);
        }
        
        // Recharger le cart pour obtenir les données actualisées
        Cart updatedCart = cartRepository.findById(cart.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cart.getId().toString()));
        
        return mapToDtoWithDetails(updatedCart);
    }
    
    @Override
    public CartDto removeArticleFromCart(Integer customerId, Long articleId) {
        log.info("Suppression d'article {} du panier du client {}", articleId, customerId);
        
        Cart cart = cartRepository.findByCustomerId(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", customerId.toString()));
        
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ResourceNotFoundException("Article", "articleId", articleId.toString()));
        
        CartArticle cartArticle = cartArticleRepository.findByCartAndArticle(cart, article)
            .orElseThrow(() -> new ResourceNotFoundException("CartArticle", "articleId", articleId.toString()));
        
        // Supprimer la ligne de panier
        cartArticleRepository.delete(cartArticle);
        
        log.info("Article {} supprimé du panier", articleId);
        
        // Recharger le cart
        Cart updatedCart = cartRepository.findById(cart.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cart.getId().toString()));
        
        return mapToDtoWithDetails(updatedCart);
    }
    
    @Override
    public void clearCart(Integer customerId) {
        log.info("Vidage du panier du client: {}", customerId);
        
        Cart cart = cartRepository.findByCustomerId(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", customerId.toString()));
        
        // Supprimer toutes les lignes de panier
        cartArticleRepository.deleteByCart(cart);
        
        // Vider la liste des articles
        cart.getArticles().clear();
        cartRepository.save(cart);
        
        log.info("Panier du client {} vidé", customerId);
    }
    
    @Override
    public void deleteCart(Integer cartId) {
        log.info("Suppression du panier: {}", cartId);
        if (!cartRepository.existsById(cartId)) {
            throw new ResourceNotFoundException("Cart", "cartId", cartId.toString());
        }
        
        Cart cart = cartRepository.findById(cartId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId.toString()));
        
        // Supprimer d'abord les lignes de panier
        cartArticleRepository.deleteByCart(cart);
        
        // Puis supprimer le panier
        cartRepository.deleteById(cartId);
        
        log.info("Panier {} supprimé", cartId);
    }
    
    /**
     * Mappe le cart avec tous les détails du client et des articles (avec quantités)
     */
    private CartDto mapToDtoWithDetails(Cart cart) {
        List<CartArticle> cartArticles = cartArticleRepository.findByCart(cart);
        Pair<Double, Integer> result = this.getTotalQuantityAndPrice(cartArticles);
        return CartDto.builder()
            .id(cart.getId())
            .customer(customerMapper.toDto(cart.getCustomer()))
            .articles(cartArticleMapper.toDtoList(cartArticles))
            .totalQuantity(result.b)
            .totalPrice(result.a)
            .build();
    }

    private Pair<Double, Integer> getTotalQuantityAndPrice(List<CartArticle> cartArticles){
        return cartArticles.stream()
                .map(cartArticle -> new Pair<Double, Integer>(cartArticle.getArticle().getPrice() * cartArticle.getQuantity(), cartArticle.getQuantity()))
                .reduce(new Pair<Double, Integer>(0.0, 0), (acc, e) -> new Pair<Double, Integer>(acc.a + e.a, acc.b + e.b));
    }
}
