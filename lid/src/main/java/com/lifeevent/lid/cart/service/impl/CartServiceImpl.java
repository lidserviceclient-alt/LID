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
import com.lifeevent.lid.common.enumeration.CommerceItemType;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.ticket.entity.TicketEvent;
import com.lifeevent.lid.ticket.repository.TicketEventRepository;
import com.lifeevent.lid.ticket.service.TicketInventoryService;
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
    private final TicketEventRepository ticketEventRepository;
    private final TicketInventoryService ticketInventoryService;
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
        if (request == null) {
            throw new IllegalArgumentException("item requis");
        }
        int quantity = safeQuantity(request.getQuantity());
        CommerceItemType itemType = resolveItemType(request);
        if (quantity <= 0 && itemType == CommerceItemType.ARTICLE) {
            return removeArticleFromCart(customerId, request.getArticleId(), request.getColor(), request.getSize());
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("La quantité doit être strictement positive");
        }

        Cart cart = requireOrCreateCart(customerId);
        Article article = itemType == CommerceItemType.ARTICLE ? requireAvailableArticle(request.getArticleId()) : null;
        TicketEvent ticketEvent = itemType == CommerceItemType.TICKET ? requireAvailableTicket(request.getTicketEventId(), quantity) : null;
        String color = normalizeVariant(request.getColor());
        String size = normalizeVariant(request.getSize());

        CartArticle line = itemType == CommerceItemType.ARTICLE
                ? cartArticleRepository.findByCartAndArticleAndVariant(cart, article, color, size).orElse(null)
                : cartArticleRepository.findByCartAndTicketEvent(cart, ticketEvent).orElse(null);
        if (line == null) {
            line = CartArticle.builder()
                    .cart(cart)
                    .itemType(itemType)
                    .article(article)
                    .ticketEvent(ticketEvent)
                    .quantity(quantity)
                    .color(color)
                    .size(size)
                    .priceAtAddedTime(resolveUnitPrice(article, ticketEvent))
                    .build();
        } else {
            line.setItemType(itemType);
            line.setArticle(article);
            line.setTicketEvent(ticketEvent);
            line.setQuantity(quantity);
            line.setColor(itemType == CommerceItemType.ARTICLE ? color : null);
            line.setSize(itemType == CommerceItemType.ARTICLE ? size : null);
            if (line.getPriceAtAddedTime() == null) {
                line.setPriceAtAddedTime(resolveUnitPrice(article, ticketEvent));
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
                .filter(item -> resolveItemType(item) == CommerceItemType.ARTICLE && item.getArticleId() != null && safeQuantity(item.getQuantity()) > 0)
                .map(AddToCartDto::getArticleId)
                .collect(Collectors.toSet());
        Set<Long> ticketEventIds = (items == null ? List.<AddToCartDto>of() : items).stream()
                .filter(item -> resolveItemType(item) == CommerceItemType.TICKET && item.getTicketEventId() != null && safeQuantity(item.getQuantity()) > 0)
                .map(AddToCartDto::getTicketEventId)
                .collect(Collectors.toSet());

        for (AddToCartDto raw : items == null ? List.<AddToCartDto>of() : items) {
            if (raw == null) {
                continue;
            }
            int qty = safeQuantity(raw.getQuantity());
            if (qty <= 0) {
                continue;
            }
            CommerceItemType itemType = resolveItemType(raw);
            String color = normalizeVariant(raw.getColor());
            String size = normalizeVariant(raw.getSize());
            String key = cartKey(itemType, raw.getArticleId(), raw.getTicketEventId(), color, size);
            AddToCartDto normalized = AddToCartDto.builder()
                    .itemType(itemType)
                    .articleId(raw.getArticleId())
                    .ticketEventId(raw.getTicketEventId())
                    .quantity(qty)
                    .color(itemType == CommerceItemType.ARTICLE ? color : null)
                    .size(itemType == CommerceItemType.ARTICLE ? size : null)
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
        Map<Long, TicketEvent> ticketEventsById = ticketEventRepository.findAllById(ticketEventIds).stream()
                .collect(Collectors.toMap(TicketEvent::getId, ticketEvent -> ticketEvent));
        for (Long ticketEventId : ticketEventIds) {
            TicketEvent ticketEvent = ticketEventsById.get(ticketEventId);
            if (ticketEvent == null) {
                throw new ResourceNotFoundException("TicketEvent", "id", String.valueOf(ticketEventId));
            }
        }

        Map<String, CartArticle> existingByKey = existingLines.stream()
                .collect(Collectors.toMap(
                        line -> cartKey(
                                line.getItemType(),
                                line.getArticle() == null ? null : line.getArticle().getId(),
                                line.getTicketEvent() == null ? null : line.getTicketEvent().getId(),
                                normalizeVariant(line.getColor()),
                                normalizeVariant(line.getSize())
                        ),
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
            CommerceItemType itemType = resolveItemType(desired);
            Article article = itemType == CommerceItemType.ARTICLE ? articlesById.get(desired.getArticleId()) : null;
            TicketEvent ticketEvent = itemType == CommerceItemType.TICKET ? ticketEventsById.get(desired.getTicketEventId()) : null;
            if (itemType == CommerceItemType.TICKET) {
                requireSellableQuantity(ticketEvent, safeQuantity(desired.getQuantity()));
            }
            if (existing == null) {
                cartArticleRepository.save(CartArticle.builder()
                        .cart(cart)
                        .itemType(itemType)
                        .article(article)
                        .ticketEvent(ticketEvent)
                        .quantity(safeQuantity(desired.getQuantity()))
                        .color(itemType == CommerceItemType.ARTICLE ? normalizeVariant(desired.getColor()) : null)
                        .size(itemType == CommerceItemType.ARTICLE ? normalizeVariant(desired.getSize()) : null)
                        .priceAtAddedTime(resolveUnitPrice(article, ticketEvent))
                        .build());
            } else if (!existing.getQuantity().equals(safeQuantity(desired.getQuantity()))) {
                existing.setItemType(itemType);
                existing.setArticle(article);
                existing.setTicketEvent(ticketEvent);
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
                        .itemType(line.getItemType())
                        .articleId(line.getArticle() == null ? null : line.getArticle().getId())
                        .ticketEventId(line.getTicketEvent() == null ? null : line.getTicketEvent().getId())
                        .sku(line.getArticle() == null ? null : line.getArticle().getSku())
                        .referenceProduitPartenaire(line.getArticle() == null ? null : line.getArticle().getSku())
                        .articleName(resolveLineName(line))
                        .articleImage(resolveLineImage(line))
                        .color(normalizeVariant(line.getColor()))
                        .size(normalizeVariant(line.getSize()))
                        .quantity(safeQuantity(line.getQuantity()))
                        .price(resolveUnitPrice(line.getArticle(), line.getTicketEvent()))
                        .priceAtAddedTime(line.getPriceAtAddedTime())
                        .subtotal(resolveUnitPrice(line.getArticle(), line.getTicketEvent()) * safeQuantity(line.getQuantity()))
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
                .map(cartArticle -> new Pair<Double, Integer>(resolveUnitPrice(cartArticle.getArticle(), cartArticle.getTicketEvent()) * cartArticle.getQuantity(), cartArticle.getQuantity()))
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

    private CommerceItemType resolveItemType(AddToCartDto item) {
        if (item != null && item.getItemType() != null) {
            return item.getItemType();
        }
        if (item != null && item.getTicketEventId() != null) {
            return CommerceItemType.TICKET;
        }
        return CommerceItemType.ARTICLE;
    }

    private String normalizeVariant(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String cartKey(CommerceItemType itemType, Long articleId, Long ticketEventId, String color, String size) {
        String colorKey = Optional.ofNullable(normalizeVariant(color)).orElse("").toLowerCase();
        String sizeKey = Optional.ofNullable(normalizeVariant(size)).orElse("").toLowerCase();
        long articleKey = articleId == null ? 0L : articleId;
        long ticketKey = ticketEventId == null ? 0L : ticketEventId;
        return (itemType == null ? CommerceItemType.ARTICLE : itemType).name() + "::" + articleKey + "::" + ticketKey + "::" + colorKey + "::" + sizeKey;
    }

    private TicketEvent requireAvailableTicket(Long ticketEventId, int quantity) {
        if (ticketEventId == null) {
            throw new IllegalArgumentException("ticketEventId is required");
        }
        TicketEvent ticketEvent = ticketEventRepository.findById(ticketEventId)
                .orElseThrow(() -> new ResourceNotFoundException("TicketEvent", "id", String.valueOf(ticketEventId)));
        requireSellableQuantity(ticketEvent, quantity);
        return ticketEvent;
    }

    private void requireSellableQuantity(TicketEvent ticketEvent, int quantity) {
        if (!ticketInventoryService.isSellable(ticketEvent)) {
            throw new IllegalArgumentException("Ticket indisponible");
        }
        if (safeQuantity(ticketEvent.getQuantityAvailable()) < quantity) {
            throw new IllegalArgumentException("Stock insuffisant pour le ticket " + ticketEvent.getId());
        }
    }

    private Double resolveUnitPrice(Article article, TicketEvent ticketEvent) {
        if (article != null && article.getPrice() != null) {
            return article.getPrice();
        }
        return ticketEvent != null && ticketEvent.getPrice() != null ? ticketEvent.getPrice() : 0D;
    }

    private String resolveLineName(CartArticle line) {
        if (line.getArticle() != null) {
            return line.getArticle().getName();
        }
        return line.getTicketEvent() == null ? null : line.getTicketEvent().getTitle();
    }

    private String resolveLineImage(CartArticle line) {
        if (line.getArticle() != null) {
            return line.getArticle().getMainImageUrl();
        }
        return line.getTicketEvent() == null ? null : line.getTicketEvent().getImageUrl();
    }
}
