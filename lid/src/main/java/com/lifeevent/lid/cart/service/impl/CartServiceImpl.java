package com.lifeevent.lid.cart.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.cart.dto.AddToCartDto;
import com.lifeevent.lid.cart.dto.CartDto;
import com.lifeevent.lid.cart.dto.CartItemDto;
import com.lifeevent.lid.cart.entity.Cart;
import com.lifeevent.lid.cart.entity.CartArticle;
import com.lifeevent.lid.cart.mapper.CartArticleMapper;
import com.lifeevent.lid.cart.repository.CartArticleRepository;
import com.lifeevent.lid.cart.repository.CartRepository;
import com.lifeevent.lid.cart.service.CartService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.mapper.CustomerMapper;
import com.lifeevent.lid.user.common.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.antlr.v4.runtime.misc.Pair;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {
    
    private final CartRepository cartRepository;
    private final CartArticleRepository cartArticleRepository;
    private final ArticleRepository articleRepository;
    private final CartArticleMapper cartArticleMapper;
    private final CustomerMapper customerMapper;
    private final UserService userService;
    
    @Override
    public CartDto createCart(String customerId) {
        log.info("Création d'un panier pour le client: {}", customerId);

        Optional<Cart> existing = cartRepository.findByCustomer_userId(customerId);
        if (existing.isPresent()) {
            return mapToDtoWithDetails(existing.get());
        }

        Customer customer = userService.getCustomerProfile(customerId)
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
    public Optional<CartDto> getCartByCustomerId(String customerId) {
        return cartRepository.findByCustomer_userId(customerId).map(this::mapToDtoWithDetails);
    }
    
    @Override
    public CartDto addArticleToCart(String customerId, Long articleId) {
        Cart cart = requireOrCreateCart(customerId);
        Article article = requireAvailableArticle(articleId);
        CartArticle existing = cartArticleRepository
                .findByCartAndArticleAndVariant(cart, article, null, null)
                .orElse(null);
        int nextQuantity = existing == null ? 1 : Math.max(1, safeQuantity(existing.getQuantity()) + 1);
        return upsertCartItem(customerId, AddToCartDto.builder()
                .articleId(articleId)
                .quantity(nextQuantity)
                .build());
    }

    @Override
    public CartDto upsertCartItem(String customerId, AddToCartDto request) {
        if (request == null || request.getArticleId() == null) {
            throw new IllegalArgumentException("articleId is required");
        }
        int quantity = safeQuantity(request.getQuantity());
        if (quantity <= 0) {
            return removeArticleFromCart(customerId, request.getArticleId(), request.getColor(), request.getSize());
        }

        Cart cart = requireOrCreateCart(customerId);
        Article article = requireAvailableArticle(request.getArticleId());
        String color = normalizeVariant(request.getColor());
        String size = normalizeVariant(request.getSize());

        CartArticle line = cartArticleRepository
                .findByCartAndArticleAndVariant(cart, article, color, size)
                .orElse(null);
        if (line == null) {
            line = CartArticle.builder()
                    .cart(cart)
                    .article(article)
                    .quantity(quantity)
                    .color(color)
                    .size(size)
                    .priceAtAddedTime(article.getPrice())
                    .build();
        } else {
            line.setQuantity(quantity);
            line.setColor(color);
            line.setSize(size);
            if (line.getPriceAtAddedTime() == null) {
                line.setPriceAtAddedTime(article.getPrice());
            }
        }
        cartArticleRepository.save(line);
        return mapToDtoWithDetails(cart);
    }

    @Override
    public CartDto removeArticleFromCart(String customerId, Long articleId) {
        return removeArticleFromCart(customerId, articleId, null, null);
    }

    @Override
    public CartDto removeArticleFromCart(String customerId, Long articleId, String color, String size) {
        log.info("Suppression d'article {} du panier du client {}", articleId, customerId);
        Cart cart = requireOrCreateCart(customerId);
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Article", "articleId", String.valueOf(articleId)));

        String normalizedColor = normalizeVariant(color);
        String normalizedSize = normalizeVariant(size);

        if (normalizedColor == null && normalizedSize == null) {
            List<CartArticle> lines = cartArticleRepository.findAllByCartAndArticle(cart, article);
            if (lines.isEmpty()) {
                throw new ResourceNotFoundException("CartArticle", "articleId", String.valueOf(articleId));
            }
            cartArticleRepository.deleteAll(lines);
            return mapToDtoWithDetails(cart);
        }

        CartArticle line = cartArticleRepository
                .findByCartAndArticleAndVariant(cart, article, normalizedColor, normalizedSize)
                .orElseThrow(() -> new ResourceNotFoundException("CartArticle", "articleId", String.valueOf(articleId)));
        cartArticleRepository.delete(line);
        return mapToDtoWithDetails(cart);
    }

    @Override
    public CartDto syncCart(String customerId, List<AddToCartDto> items) {
        Cart cart = requireOrCreateCart(customerId);
        List<CartArticle> existingLines = cartArticleRepository.findByCart(cart);

        Map<String, AddToCartDto> desiredByKey = new LinkedHashMap<>();
        Set<Long> articleIds = (items == null ? List.<AddToCartDto>of() : items).stream()
                .filter(item -> item != null && item.getArticleId() != null && safeQuantity(item.getQuantity()) > 0)
                .map(AddToCartDto::getArticleId)
                .collect(Collectors.toSet());

        for (AddToCartDto raw : items == null ? List.<AddToCartDto>of() : items) {
            if (raw == null || raw.getArticleId() == null) {
                continue;
            }
            int qty = safeQuantity(raw.getQuantity());
            if (qty <= 0) {
                continue;
            }
            String color = normalizeVariant(raw.getColor());
            String size = normalizeVariant(raw.getSize());
            String key = cartKey(raw.getArticleId(), color, size);
            AddToCartDto normalized = AddToCartDto.builder()
                    .articleId(raw.getArticleId())
                    .quantity(qty)
                    .color(color)
                    .size(size)
                    .build();
            desiredByKey.merge(key, normalized, (left, right) -> {
                left.setQuantity(safeQuantity(left.getQuantity()) + safeQuantity(right.getQuantity()));
                return left;
            });
        }

        Map<Long, Article> articlesById = articleRepository.findAllById(articleIds).stream()
                .collect(Collectors.toMap(Article::getId, article -> article));
        for (Long articleId : articleIds) {
            Article article = articlesById.get(articleId);
            if (article == null) {
                throw new ResourceNotFoundException("Article", "articleId", String.valueOf(articleId));
            }
            if (ArticleStatus.DRAFT.equals(article.getStatus())) {
                throw new RuntimeException("Article is not available");
            }
        }

        Map<String, CartArticle> existingByKey = existingLines.stream()
                .collect(Collectors.toMap(
                        line -> cartKey(line.getArticle().getId(), normalizeVariant(line.getColor()), normalizeVariant(line.getSize())),
                        line -> line,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));

        List<CartArticle> toDelete = new ArrayList<>();
        for (Map.Entry<String, CartArticle> entry : existingByKey.entrySet()) {
            if (!desiredByKey.containsKey(entry.getKey())) {
                toDelete.add(entry.getValue());
            }
        }
        if (!toDelete.isEmpty()) {
            cartArticleRepository.deleteAll(toDelete);
        }

        for (Map.Entry<String, AddToCartDto> entry : desiredByKey.entrySet()) {
            AddToCartDto desired = entry.getValue();
            CartArticle existing = existingByKey.get(entry.getKey());
            Article article = articlesById.get(desired.getArticleId());
            if (existing == null) {
                cartArticleRepository.save(CartArticle.builder()
                        .cart(cart)
                        .article(article)
                        .quantity(safeQuantity(desired.getQuantity()))
                        .color(normalizeVariant(desired.getColor()))
                        .size(normalizeVariant(desired.getSize()))
                        .priceAtAddedTime(article.getPrice())
                        .build());
            } else if (!existing.getQuantity().equals(safeQuantity(desired.getQuantity()))) {
                existing.setQuantity(safeQuantity(desired.getQuantity()));
                cartArticleRepository.save(existing);
            }
        }

        return mapToDtoWithDetails(cart);
    }

    @Override
    public void clearCart(String customerId) {
        log.info("Vidage du panier du client: {}", customerId);
        
        Cart cart = cartRepository.findByCustomer_userId(customerId)
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
        List<CartItemDto> items = cartArticles.stream()
                .map(line -> CartItemDto.builder()
                        .id(line.getId())
                        .articleId(line.getArticle() == null ? null : line.getArticle().getId())
                        .sku(line.getArticle() == null ? null : line.getArticle().getSku())
                        .referenceProduitPartenaire(line.getArticle() == null ? null : line.getArticle().getSku())
                        .articleName(line.getArticle() == null ? null : line.getArticle().getName())
                        .articleImage(line.getArticle() == null ? null : line.getArticle().getMainImageUrl())
                        .color(normalizeVariant(line.getColor()))
                        .size(normalizeVariant(line.getSize()))
                        .quantity(safeQuantity(line.getQuantity()))
                        .price(line.getArticle() == null ? 0D : line.getArticle().getPrice())
                        .priceAtAddedTime(line.getPriceAtAddedTime())
                        .subtotal((line.getArticle() == null ? 0D : line.getArticle().getPrice()) * safeQuantity(line.getQuantity()))
                        .build())
                .toList();
        return CartDto.builder()
            .id(cart.getId())
            .customer(customerMapper.toDto(cart.getCustomer()))
            .articles(cartArticleMapper.toDtoList(cartArticles))
            .items(items)
            .totalQuantity(result.b)
            .totalPrice(result.a)
            .build();
    }

    private Pair<Double, Integer> getTotalQuantityAndPrice(List<CartArticle> cartArticles){
        return cartArticles.stream()
                .map(cartArticle -> new Pair<Double, Integer>(cartArticle.getArticle().getPrice() * cartArticle.getQuantity(), cartArticle.getQuantity()))
                .reduce(new Pair<Double, Integer>(0.0, 0), (acc, e) -> new Pair<Double, Integer>(acc.a + e.a, acc.b + e.b));
    }

    private Cart requireOrCreateCart(String customerId) {
        return cartRepository.findByCustomer_userId(customerId).orElseGet(() -> {
            Customer customer = userService.getCustomerProfile(customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", "customerId", customerId));
            return cartRepository.save(Cart.builder()
                    .customer(customer)
                    .articles(new ArrayList<>())
                    .build());
        });
    }

    private Article requireAvailableArticle(Long articleId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Article", "articleId", String.valueOf(articleId)));
        if (ArticleStatus.DRAFT.equals(article.getStatus())) {
            throw new RuntimeException("Article is not available");
        }
        return article;
    }

    private int safeQuantity(Integer quantity) {
        return quantity == null ? 0 : Math.max(0, quantity);
    }

    private String normalizeVariant(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String cartKey(Long articleId, String color, String size) {
        String colorKey = Optional.ofNullable(normalizeVariant(color)).orElse("").toLowerCase();
        String sizeKey = Optional.ofNullable(normalizeVariant(size)).orElse("").toLowerCase();
        return articleId + "::" + colorKey + "::" + sizeKey;
    }
}
