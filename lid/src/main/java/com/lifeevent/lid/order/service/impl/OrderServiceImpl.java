package com.lifeevent.lid.order.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.cart.entity.Cart;
import com.lifeevent.lid.cart.entity.CartArticle;
import com.lifeevent.lid.cart.repository.CartArticleRepository;
import com.lifeevent.lid.cart.repository.CartRepository;
import com.lifeevent.lid.common.enumeration.CommerceItemType;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.pricing.VatPricingService;
import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.common.util.PhoneNumberUtils;
import com.lifeevent.lid.discount.entity.Discount;
import com.lifeevent.lid.discount.enumeration.DiscountTarget;
import com.lifeevent.lid.discount.enumeration.DiscountType;
import com.lifeevent.lid.discount.repository.DiscountRepository;
import com.lifeevent.lid.common.cache.event.PartnerOrderChangedEvent;
import com.lifeevent.lid.loyalty.entity.LoyaltyTier;
import com.lifeevent.lid.loyalty.repository.LoyaltyPointAdjustmentRepository;
import com.lifeevent.lid.loyalty.repository.LoyaltyTierRepository;
import com.lifeevent.lid.order.dto.CheckoutCartRequestDto;
import com.lifeevent.lid.order.dto.CheckoutCartSelectedRequestDto;
import com.lifeevent.lid.order.dto.CheckoutItemRequestDto;
import com.lifeevent.lid.order.dto.CheckoutResponseDto;
import com.lifeevent.lid.order.dto.OrderDetailDto;
import com.lifeevent.lid.order.dto.OrderItemDto;
import com.lifeevent.lid.order.dto.OrderQuoteResponseDto;
import com.lifeevent.lid.order.dto.StatusHistoryDto;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.OrderArticle;
import com.lifeevent.lid.order.entity.StatusHistory;
import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.order.repository.OrderArticleRepository;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.order.service.OrderService;
import com.lifeevent.lid.payment.config.PaydunyaProperties;
import com.lifeevent.lid.payment.dto.CreatePaymentRequestDto;
import com.lifeevent.lid.payment.dto.PaymentItemDto;
import com.lifeevent.lid.payment.dto.PaymentResponseDto;
import com.lifeevent.lid.payment.dto.PaymentTaxDto;
import com.lifeevent.lid.payment.enums.PaymentOperator;
import com.lifeevent.lid.payment.service.PaymentService;
import com.lifeevent.lid.stock.entity.Stock;
import com.lifeevent.lid.stock.repository.StockRepository;
import com.lifeevent.lid.ticket.entity.TicketEvent;
import com.lifeevent.lid.ticket.repository.TicketEventRepository;
import com.lifeevent.lid.ticket.service.TicketInventoryService;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import com.lifeevent.lid.user.common.repository.UserEntityRepository;
import com.lifeevent.lid.user.common.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private static final Pattern DISCOUNT_PERCENT_PATTERN = Pattern.compile("(-?\\s*\\d{1,2}(?:[\\.,]\\d{1,2})?)\\s*%");

    private final OrderRepository orderRepository;
    private final OrderArticleRepository orderArticleRepository;
    private final CartRepository cartRepository;
    private final CartArticleRepository cartArticleRepository;
    private final CustomerRepository customerRepository;
    private final UserEntityRepository userEntityRepository;
    private final UserService userService;
    private final StockRepository stockRepository;
    private final ArticleRepository articleRepository;
    private final TicketEventRepository ticketEventRepository;
    private final TicketInventoryService ticketInventoryService;
    private final DiscountRepository discountRepository;
    private final LoyaltyTierRepository loyaltyTierRepository;
    private final LoyaltyPointAdjustmentRepository loyaltyPointAdjustmentRepository;
    private final VatPricingService vatPricingService;
    private final PaymentService paymentService;
    private final PaydunyaProperties paydunyaProperties;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public CheckoutResponseDto checkoutCart(String customerId, CheckoutCartRequestDto request) {
        log.info("Checkout panier pour le client: {}", customerId);
        Customer customer = getOrCreateCustomerForCheckout(customerId);
        CheckoutData checkoutData = resolveCheckoutData(customerId, request);
        QuoteComputation quote = computeQuote(checkoutData.lines(), request, true);
        double shippingCost = normalizeShippingCost(request);
        double totalAmount = round2(quote.totalAmount() + shippingCost);
        return executeCheckout(customer, request, checkoutData.lines(), checkoutData.cartToClear(), totalAmount);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderQuoteResponseDto checkoutQuote(String customerId, CheckoutCartRequestDto request) {
        CheckoutData checkoutData = resolveCheckoutData(customerId, request);
        QuoteComputation quote = computeQuote(checkoutData.lines(), request, false);
        double vatAmount = calculateVatIncludedAmount(quote.totalAmount());
        return OrderQuoteResponseDto.builder()
                .subTotal(round2(quote.subTotal()))
                .discountAmount(round2(quote.promo().discountAmount()))
                .loyaltyDiscountAmount(round2(quote.loyalty().discountAmount()))
                .vatAmount(vatAmount)
                .vatRate(round2(resolveConfiguredVatRate() * 100d))
                .total(round2(quote.totalAmount()))
                .promoApplied(quote.promo().applied())
                .promoCode(quote.promo().code())
                .promoMessage(quote.promo().message())
                .loyaltyApplied(quote.loyalty().applied())
                .loyaltyTier(quote.loyalty().tierName())
                .loyaltyDiscountPercent(round2(quote.loyalty().discountPercent()))
                .loyaltyPoints(quote.loyalty().points())
                .build();
    }

    @Override
    public CheckoutResponseDto checkoutSelectedArticles(String customerId, CheckoutCartSelectedRequestDto request) {
        log.info("Checkout articles sélectionnés pour le client: {}", customerId);
        Customer customer = getOrCreateCustomerForCheckout(customerId);
        List<CheckoutLine> lines = buildSelectedCheckoutLines(request);
        QuoteComputation quote = computeQuote(lines, request, true);
        double shippingCost = normalizeShippingCost(request);
        double totalAmount = round2(quote.totalAmount() + shippingCost);
        return executeCheckout(customer, request, lines, null, totalAmount);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<OrderDetailDto> getOrderById(Long orderId) {
        log.info("Récupération de la commande: {}", orderId);
        return orderRepository.findWithDetailsById(orderId)
                .map(this::attachStatusHistory)
                .map(this::mapToDetailDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDetailDto> getOrdersByCustomer(String customerId, int page, int size) {
        log.info("Récupération des commandes du client: {}", customerId);
        requireExistingCustomer(customerId);

        Pageable pageable = PageRequest.of(page, size);
        List<Long> orderIds = orderRepository.findIdsByCustomerUserId(customerId, pageable).getContent();
        if (orderIds.isEmpty()) {
            return List.of();
        }
        Map<Long, Order> ordersById = new HashMap<>();
        for (Order order : orderRepository.findWithArticlesAndStatusHistoryByIdIn(orderIds)) {
            ordersById.put(order.getId(), order);
        }
        for (Order orderWithHistory : orderRepository.findWithStatusHistoryByIdIn(orderIds)) {
            Order baseOrder = ordersById.get(orderWithHistory.getId());
            if (baseOrder != null) {
                baseOrder.setStatusHistory(orderWithHistory.getStatusHistory());
            }
        }
        List<OrderDetailDto> out = new ArrayList<>();
        for (Long id : orderIds) {
            Order order = ordersById.get(id);
            if (order != null) {
                out.add(mapToDetailDto(order));
            }
        }
        return out;
    }

    private Order attachStatusHistory(Order order) {
        if (order == null || order.getId() == null) {
            return order;
        }
        return orderRepository.findWithCustomerAndStatusHistoryById(order.getId())
                .map(withHistory -> {
                    order.setStatusHistory(withHistory.getStatusHistory());
                    return order;
                })
                .orElse(order);
    }

    @Override
    public void updateOrderStatus(Long orderId, Status newStatus, String comment) {
        log.info("Mise à jour du statut de la commande {}: {}", orderId, newStatus);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));

        appendStatusHistory(order, newStatus, comment);
        order.setCurrentStatus(newStatus);
        orderRepository.save(order);
        publishPartnerOrderChanged(orderRepository.findDistinctPartnerIdsByOrderId(orderId));
    }

    @Override
    public void confirmPayment(Long orderId) {
        log.info("Confirmation du paiement pour la commande: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));

        if (order.getCurrentStatus() != Status.PENDING) {
            throw new IllegalArgumentException("La commande n'est pas en attente de paiement");
        }

        consumeReservedStocks(order);
        updateOrderStatus(orderId, Status.PAID, "Paiement confirmé");
    }

    @Override
    public void cancelOrder(Long orderId, String reason) {
        log.info("Annulation de la commande: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));

        if (order.getCurrentStatus() == Status.PENDING) {
            releaseReservedStocks(order);
        }
        updateOrderStatus(orderId, Status.CANCELED, reason);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isOwnedByCurrentUser(Long orderId) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return false;
        }

        return orderRepository.findById(orderId)
                .map(order -> currentUserId.equals(order.getCustomer().getUserId()))
                .orElse(false);
    }

    private CheckoutData resolveCheckoutData(String customerId, CheckoutCartRequestDto request) {
        if (hasPayloadItems(request)) {
            List<CheckoutLine> lines = buildPayloadCheckoutLines(request.getItems());
            validateStockAvailability(lines);
            return new CheckoutData(lines, null);
        }
        CheckoutData fromCart = buildCartCheckoutData(customerId);
        validateStockAvailability(fromCart.lines());
        return fromCart;
    }

    private boolean hasPayloadItems(CheckoutCartRequestDto request) {
        return request != null && request.getItems() != null && !request.getItems().isEmpty();
    }

    private CheckoutData buildCartCheckoutData(String customerId) {
        Cart cart = cartRepository.findByCustomer_userId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", customerId));

        List<CartArticle> cartItems = cartArticleRepository.findByCart(cart);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Le panier est vide");
        }

        List<CheckoutLine> lines = cartItems.stream()
                .collect(Collectors.groupingBy(ca -> cartCheckoutKey(ca),
                        Collectors.collectingAndThen(Collectors.toList(), groupedItems -> {
                            CartArticle first = groupedItems.get(0);
                            Article article = first.getArticle();
                            TicketEvent ticketEvent = first.getTicketEvent();
                            int totalQuantity = groupedItems.stream()
                                    .map(CartArticle::getQuantity)
                                    .mapToInt(this::normalizeQuantity)
                                    .sum();
                            return new CheckoutLine(
                                    first.getItemType(),
                                    article,
                                    ticketEvent,
                                    totalQuantity,
                                    resolveUnitPrice(article, ticketEvent)
                            );
                        })))
                .values()
                .stream()
                .toList();

        return new CheckoutData(lines, cart);
    }

    private List<CheckoutLine> buildPayloadCheckoutLines(List<CheckoutItemRequestDto> items) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("La liste des articles est obligatoire");
        }

        Map<String, CheckoutAggregation> aggregatedByLineKey = items.stream()
                .peek(this::validatePayloadItem)
                .map(this::toAggregationEntry)
                .collect(Collectors.toMap(
                        CheckoutAggregation::lineKey,
                        entry -> entry,
                        (left, right) -> new CheckoutAggregation(
                                left.lineKey(),
                                left.itemType(),
                                left.article(),
                                left.ticketEvent(),
                                left.quantity() + right.quantity()
                        )
                ));

        if (aggregatedByLineKey.isEmpty()) {
            throw new IllegalArgumentException("Le panier est vide");
        }

        return aggregatedByLineKey.values().stream()
                .map(entry -> new CheckoutLine(
                        entry.itemType(),
                        entry.article(),
                        entry.ticketEvent(),
                        entry.quantity(),
                        resolveUnitPrice(entry.article(), entry.ticketEvent())
                ))
                .toList();
    }

    private CheckoutAggregation toAggregationEntry(CheckoutItemRequestDto item) {
        CommerceItemType itemType = resolveItemType(item);
        Article article = itemType == CommerceItemType.ARTICLE ? resolveArticle(item) : null;
        TicketEvent ticketEvent = itemType == CommerceItemType.TICKET ? resolveTicketEvent(item) : null;
        return new CheckoutAggregation(
                checkoutKey(itemType, article == null ? null : article.getId(), ticketEvent == null ? null : ticketEvent.getId()),
                itemType,
                article,
                ticketEvent,
                normalizeQuantity(item.getQuantity())
        );
    }

    private Article resolveArticle(CheckoutItemRequestDto item) {
        if (item.getArticleId() != null) {
            return articleRepository.findById(item.getArticleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Article", "id", item.getArticleId().toString()));
        }

        String reference = safeTrim(item.getReferenceProduitPartenaire());
        if (!reference.isEmpty()) {
            Optional<Article> bySku = articleRepository.findBySku(reference);
            if (bySku.isPresent()) {
                return bySku.get();
            }
            Optional<Article> byEan = articleRepository.findByEan(reference);
            if (byEan.isPresent()) {
                return byEan.get();
            }
            if (isStrictlyNumeric(reference)) {
                Optional<Article> byId = articleRepository.findById(Long.parseLong(reference));
                if (byId.isPresent()) {
                    return byId.get();
                }
            }
            throw new ResourceNotFoundException("Article", "referenceProduitPartenaire", reference);
        }

        throw new IllegalArgumentException("articleId ou referenceProduitPartenaire est obligatoire");
    }

    private TicketEvent resolveTicketEvent(CheckoutItemRequestDto item) {
        if (item.getTicketEventId() == null) {
            throw new IllegalArgumentException("ticketEventId est obligatoire");
        }
        return ticketEventRepository.findById(item.getTicketEventId())
                .orElseThrow(() -> new ResourceNotFoundException("TicketEvent", "id", item.getTicketEventId().toString()));
    }

    private void validatePayloadItem(CheckoutItemRequestDto item) {
        if (item == null) {
            throw new IllegalArgumentException("Ligne article invalide");
        }
        CommerceItemType itemType = resolveItemType(item);
        if (itemType == CommerceItemType.ARTICLE && item.getArticleId() == null && safeTrim(item.getReferenceProduitPartenaire()).isEmpty()) {
            throw new IllegalArgumentException("articleId ou referenceProduitPartenaire est obligatoire");
        }
        if (itemType == CommerceItemType.TICKET && item.getTicketEventId() == null) {
            throw new IllegalArgumentException("ticketEventId est obligatoire");
        }
        if (normalizeQuantity(item.getQuantity()) <= 0) {
            throw new IllegalArgumentException("La quantité doit être strictement positive");
        }
    }

    private void validateStockAvailability(List<CheckoutLine> lines) {
        if (lines == null || lines.isEmpty()) {
            return;
        }

        List<Long> articleIds = lines.stream()
                .filter(line -> line.itemType() == CommerceItemType.ARTICLE)
                .map(CheckoutLine::article)
                .filter(java.util.Objects::nonNull)
                .map(Article::getId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, Integer> availableByArticleId = stockRepository.sumAvailableByArticleIds(articleIds).stream()
                .collect(Collectors.toMap(
                        StockRepository.ArticleStockTotalView::getArticleId,
                        row -> row.getStock() == null ? 0 : row.getStock(),
                        (left, right) -> left
                ));

        for (CheckoutLine line : lines) {
            if (line.itemType() == CommerceItemType.ARTICLE) {
                Long articleId = line.article().getId();
                int requested = line.quantity();
                int available = availableByArticleId.getOrDefault(articleId, 0);
                if (available < requested) {
                    throw new IllegalArgumentException("Stock insuffisant pour l'article " + articleId);
                }
                continue;
            }
            TicketEvent ticketEvent = line.ticketEvent();
            if (!ticketInventoryService.isSellable(ticketEvent) || normalizeTicketAvailable(ticketEvent) < line.quantity()) {
                throw new IllegalArgumentException("Stock insuffisant pour le ticket " + (ticketEvent == null ? "" : ticketEvent.getId()));
            }
        }
    }

    private QuoteComputation computeQuote(List<CheckoutLine> lines, CheckoutCartRequestDto request, boolean strictPromo) {
        double subTotal = calculateSubTotal(lines);
        if (subTotal <= 0d) {
            throw new IllegalArgumentException("Le panier est vide");
        }

        PromoApplication promo = evaluatePromo(request, subTotal);
        validateStrictPromo(strictPromo, request, promo);

        LoyaltyPricing loyalty = evaluateLoyalty(request, subTotal, promo.applied());
        double total = subTotal - promo.discountAmount() - loyalty.discountAmount();
        if (total < 0d) {
            total = 0d;
        }
        return new QuoteComputation(subTotal, promo, loyalty, total);
    }

    private PromoApplication evaluatePromo(CheckoutCartRequestDto request, double subTotal) {
        String requestedCode = request == null ? "" : safeTrim(request.getPromoCode());
        if (requestedCode.isEmpty()) {
            return new PromoApplication(false, null, 0d, null, null);
        }

        Discount discount = discountRepository.findByCodeIgnoreCase(requestedCode).orElse(null);
        if (discount == null) {
            return new PromoApplication(false, requestedCode, 0d, "Code promo introuvable", null);
        }
        if (!Boolean.TRUE.equals(discount.getIsActive())) {
            return new PromoApplication(false, discount.getCode(), 0d, "Code promo inactif", discount);
        }
        if (!isInsidePromoWindow(discount)) {
            String message = LocalDateTime.now().isBefore(discount.getStartAt()) ? "Code promo pas encore actif" : "Code promo expiré";
            return new PromoApplication(false, discount.getCode(), 0d, message, discount);
        }
        if (discount.getMinOrderAmount() != null && subTotal < discount.getMinOrderAmount()) {
            return new PromoApplication(false, discount.getCode(), 0d, "Montant minimum non atteint", discount);
        }
        if (isUsageMaxReached(discount)) {
            return new PromoApplication(false, discount.getCode(), 0d, "Code promo épuisé", discount);
        }
        if (isTargetUnsupported(discount.getTarget())) {
            return new PromoApplication(false, discount.getCode(), 0d, "Code promo non applicable à cette commande", discount);
        }

        double discountAmount = computeDiscountAmount(discount, subTotal);
        if (discountAmount <= 0d) {
            return new PromoApplication(false, discount.getCode(), 0d, "Réduction nulle", discount);
        }
        return new PromoApplication(true, discount.getCode(), discountAmount, "Code promo appliqué", discount);
    }

    private void validateStrictPromo(boolean strictPromo, CheckoutCartRequestDto request, PromoApplication promo) {
        if (!strictPromo) {
            return;
        }
        String requestedCode = request == null ? "" : safeTrim(request.getPromoCode());
        if (!requestedCode.isEmpty() && !promo.applied()) {
            throw new IllegalArgumentException(promo.message() == null ? "Code promo invalide" : promo.message());
        }
    }

    private LoyaltyPricing evaluateLoyalty(CheckoutCartRequestDto request, double subTotal, boolean promoApplied) {
        if (promoApplied || subTotal <= 0d || request == null || safeTrim(request.getEmail()).isEmpty()) {
            return new LoyaltyPricing(false, null, 0d, 0d, 0);
        }

        Optional<Customer> customer = customerRepository.findByEmail(safeTrim(request.getEmail()));
        if (customer.isEmpty()) {
            return new LoyaltyPricing(false, null, 0d, 0d, 0);
        }

        int points = (int) Math.max(0L, loyaltyPointAdjustmentRepository.sumDeltaByCustomerId(customer.get().getUserId()));
        Optional<LoyaltyTier> tier = resolveTier(points);
        if (tier.isEmpty()) {
            return new LoyaltyPricing(false, null, 0d, 0d, points);
        }

        double percent = parseDiscountPercent(tier.get().getBenefits());
        if (percent <= 0d) {
            return new LoyaltyPricing(false, tier.get().getName(), 0d, 0d, points);
        }

        double discountAmount = (subTotal * percent) / 100.0;
        if (discountAmount > subTotal) {
            discountAmount = subTotal;
        }
        return new LoyaltyPricing(true, tier.get().getName(), percent, discountAmount, points);
    }

    private Optional<LoyaltyTier> resolveTier(int points) {
        return loyaltyTierRepository.findTopByMinPointsLessThanEqualOrderByMinPointsDesc(points);
    }

    private double parseDiscountPercent(String benefits) {
        String source = benefits == null ? "" : benefits;
        Matcher matcher = DISCOUNT_PERCENT_PATTERN.matcher(source);
        double best = 0d;
        while (matcher.find()) {
            String raw = matcher.group(1);
            if (raw == null) {
                continue;
            }
            String normalized = raw.replace(" ", "").replace(",", ".");
            if (normalized.startsWith("-")) {
                normalized = normalized.substring(1);
            }
            try {
                double parsed = Double.parseDouble(normalized);
                if (parsed > best) {
                    best = parsed;
                }
            } catch (NumberFormatException ignored) {
            }
        }
        return Math.min(100d, Math.max(0d, best));
    }

    private boolean isInsidePromoWindow(Discount discount) {
        LocalDateTime now = LocalDateTime.now();
        if (discount.getStartAt() != null && now.isBefore(discount.getStartAt())) {
            return false;
        }
        if (discount.getEndAt() != null && now.isAfter(discount.getEndAt())) {
            return false;
        }
        return true;
    }

    private boolean isUsageMaxReached(Discount discount) {
        if (discount.getUsageMax() == null || discount.getUsageMax() <= 0) {
            return false;
        }
        int used = discount.getUsageCount() == null ? 0 : Math.max(0, discount.getUsageCount());
        return used >= discount.getUsageMax();
    }

    private boolean isTargetUnsupported(DiscountTarget target) {
        return target != null && target != DiscountTarget.GLOBAL;
    }

    private double computeDiscountAmount(Discount discount, double subTotal) {
        if (discount.getType() == DiscountType.FIXED) {
            return Math.min(subTotal, safeDouble(discount.getValue()));
        }
        return Math.min(subTotal, subTotal * (safeDouble(discount.getValue()) / 100.0));
    }

    private double normalizeShippingCost(CheckoutCartRequestDto request) {
        if (request == null || request.getShippingCost() == null) {
            return 0d;
        }
        return Math.max(0d, request.getShippingCost());
    }

    private CheckoutResponseDto executeCheckout(
            Customer customer,
            CheckoutCartRequestDto request,
            List<CheckoutLine> lines,
            Cart cartToClear,
            double totalAmount
    ) {
        reserveStocks(lines);

        String currency = resolveCurrency(request);
        Order savedOrder = orderRepository.save(buildPendingOrder(customer, currency, totalAmount, request));

        List<OrderArticle> savedOrderArticles = orderArticleRepository.saveAll(buildOrderArticles(savedOrder, lines));
        savedOrder.setArticles(savedOrderArticles);
        appendStatusHistory(savedOrder, Status.PENDING, "Commande créée - En attente de paiement");
        orderRepository.save(savedOrder);
        publishPartnerOrderChanged(lines.stream()
                .filter(line -> line.itemType() == CommerceItemType.ARTICLE)
                .map(line -> line.article() == null ? null : safeTrim(line.article().getReferencePartner()))
                .filter(id -> !id.isEmpty())
                .collect(Collectors.toSet()));

        clearCartIfNeeded(cartToClear);

        PaymentResponseDto payment = createPaymentForOrder(savedOrder, customer, request);

        return CheckoutResponseDto.builder()
                .orderId(savedOrder.getId())
                .amount(round2(totalAmount))
                .paymentUrl(payment.getPaymentUrl())
                .invoiceToken(payment.getInvoiceToken())
                .build();
    }

    private void publishPartnerOrderChanged(Set<String> partnerIds) {
        if (partnerIds == null || partnerIds.isEmpty()) {
            return;
        }
        eventPublisher.publishEvent(new PartnerOrderChangedEvent(partnerIds));
    }

    private PaymentResponseDto createPaymentForOrder(Order order, Customer customer, CheckoutCartRequestDto request) {
        String email = resolveCustomerEmail(customer, request);
        String fullName = resolveCustomerDisplayName(customer);
        String phone = PhoneNumberUtils.requireE164(
                request == null ? null : request.getPhone(),
                "Numéro de téléphone requis"
        );

        String returnUrl = request != null && !safeTrim(request.getReturnUrl()).isEmpty()
                ? safeTrim(request.getReturnUrl())
                : paydunyaProperties.getReturnUrl();
        String cancelUrl = request != null && !safeTrim(request.getCancelUrl()).isEmpty()
                ? safeTrim(request.getCancelUrl())
                : paydunyaProperties.getCancelUrl();

        List<PaymentItemDto> paymentItems = buildPaymentItems(order);
        PaymentTaxDto tva = buildVatTax(order.getAmount());

        CreatePaymentRequestDto paymentRequest = CreatePaymentRequestDto.builder()
                .orderId(order.getId())
                .amount(BigDecimal.valueOf(order.getAmount()))
                .description("Paiement commande ORD-" + order.getId())
                .operator(PaymentOperator.CARD_CI)
                .customerName(fullName)
                .customerEmail(email)
                .customerPhone(phone)
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .items(paymentItems)
                .taxes(List.of(tva))
                .build();

        String provider = request == null ? "" : safeTrim(request.getPaymentProvider());
        if ("LOCAL".equalsIgnoreCase(provider)) {
            return paymentService.createLocalPayment(paymentRequest);
        }
        return paymentService.createPayment(paymentRequest);
    }

    private List<PaymentItemDto> buildPaymentItems(Order order) {
        if (order.getArticles() == null) {
            return List.of();
        }
        return order.getArticles().stream()
                .map(orderArticle -> PaymentItemDto.builder()
                        .name(resolveOrderLineName(orderArticle))
                        .quantity(orderArticle.getQuantity())
                        .unitPrice(BigDecimal.valueOf(orderArticle.getPriceAtOrder()))
                        .totalPrice(BigDecimal.valueOf(orderArticle.getPriceAtOrder() * orderArticle.getQuantity()))
                        .description(resolveOrderLineDescription(orderArticle))
                        .build())
                .toList();
    }

    private PaymentTaxDto buildVatTax(double amount) {
        double vatRate = resolveConfiguredVatRate();
        double vatAmount = calculateVatIncludedAmount(amount);
        long vatPercent = Math.round(vatRate * 100d);
        return PaymentTaxDto.builder()
                .name("TVA (" + vatPercent + "%)")
                .amount(BigDecimal.valueOf(vatAmount))
                .build();
    }

    private double resolveConfiguredVatRate() {
        return vatPricingService.resolveConfiguredVatRate();
    }

    private double calculateVatAmount(double netAmount) {
        if (!Double.isFinite(netAmount) || netAmount <= 0d) {
            return 0d;
        }
        return round2(netAmount * resolveConfiguredVatRate());
    }

    private double calculateGrossAmount(double netAmount) {
        return vatPricingService.grossFromNet(netAmount);
    }

    private double calculateVatIncludedAmount(double grossAmount) {
        return vatPricingService.includedVatFromGross(grossAmount);
    }

    private String resolveCustomerEmail(Customer customer, CheckoutCartRequestDto request) {
        String requestEmail = request == null ? "" : safeTrim(request.getEmail());
        if (!requestEmail.isEmpty()) {
            return requestEmail;
        }
        String customerEmail = customer.getEmail() == null ? "" : customer.getEmail().trim();
        if (!customerEmail.isEmpty()) {
            return customerEmail;
        }
        throw new IllegalArgumentException("Email client requis");
    }

    private String resolveCustomerDisplayName(Customer customer) {
        String firstName = customer.getFirstName() == null ? "" : customer.getFirstName().trim();
        String lastName = customer.getLastName() == null ? "" : customer.getLastName().trim();
        String fullName = (firstName + " " + lastName).trim();
        if (!fullName.isEmpty()) {
            return fullName;
        }
        String email = customer.getEmail() == null ? "" : customer.getEmail().trim();
        if (!email.isEmpty()) {
            return email;
        }
        return customer.getUserId();
    }

    private String resolveCurrency(CheckoutCartRequestDto request) {
        if (request == null || safeTrim(request.getCurrency()).isEmpty()) {
            return "XOF";
        }
        return safeTrim(request.getCurrency());
    }

    private List<CheckoutLine> buildSelectedCheckoutLines(CheckoutCartSelectedRequestDto request) {
        if (request.getArticles() == null || request.getArticles().isEmpty()) {
            throw new IllegalArgumentException("La liste des articles sélectionnés est obligatoire");
        }

        Map<Long, Integer> quantitiesByArticleId = request.getArticles().stream()
                .peek(this::validateRequestedItem)
                .collect(Collectors.groupingBy(
                        CheckoutItemRequestDto::getArticleId,
                        Collectors.summingInt(item -> normalizeQuantity(item.getQuantity()))
                ));

        if (quantitiesByArticleId.isEmpty()) {
            throw new IllegalArgumentException("Aucun article fourni pour le checkout direct");
        }

        Map<Long, Article> articlesById = articleRepository.findAllById(quantitiesByArticleId.keySet()).stream()
                .collect(Collectors.toMap(Article::getId, article -> article));

        List<Long> missingArticleIds = quantitiesByArticleId.keySet().stream()
                .filter(articleId -> !articlesById.containsKey(articleId))
                .toList();

        if (!missingArticleIds.isEmpty()) {
            throw new ResourceNotFoundException("Article", "ids", missingArticleIds.toString());
        }

        return quantitiesByArticleId.entrySet().stream()
                .map(entry -> {
                    Article article = articlesById.get(entry.getKey());
                    return new CheckoutLine(
                            CommerceItemType.ARTICLE,
                            article,
                            null,
                            entry.getValue(),
                            resolveUnitPrice(article, null)
                    );
                })
                .toList();
    }

    private void validateRequestedItem(CheckoutItemRequestDto item) {
        if (item.getArticleId() == null) {
            throw new IllegalArgumentException("articleId est obligatoire pour chaque ligne");
        }
        if (normalizeQuantity(item.getQuantity()) <= 0) {
            throw new IllegalArgumentException("La quantité doit être strictement positive");
        }
    }

    private int normalizeQuantity(Integer quantity) {
        return quantity == null ? 1 : quantity;
    }

    private CommerceItemType resolveItemType(CheckoutItemRequestDto item) {
        if (item != null && item.getItemType() != null) {
            return item.getItemType();
        }
        if (item != null && item.getTicketEventId() != null) {
            return CommerceItemType.TICKET;
        }
        return CommerceItemType.ARTICLE;
    }

    private void reserveStocks(List<CheckoutLine> lines) {
        lines.forEach(line -> {
            if (line.itemType() == CommerceItemType.ARTICLE) {
                reserveStock(line.article().getId(), line.quantity());
            } else {
                ticketInventoryService.reserve(line.ticketEvent().getId(), line.quantity());
            }
        });
    }

    private double calculateSubTotal(List<CheckoutLine> lines) {
        return lines.stream()
                .mapToDouble(line -> line.unitPrice() * line.quantity())
                .sum();
    }

    private Order buildPendingOrder(Customer customer, String currency, double amount, CheckoutCartRequestDto request) {
        return Order.builder()
                .customer(customer)
                .amount(amount)
                .currency(currency)
                .shippingAddress(safeTrim(request == null ? null : request.getShippingAddress()))
                .shippingPhoneNumber(PhoneNumberUtils.normalizeE164OrNull(request == null ? null : request.getPhone()))
                .shippingMethodCode(normalizeShippingMethodCode(request == null ? null : request.getShippingMethodCode()))
                .shippingMethodLabel(safeTrim(request == null ? null : request.getShippingMethodLabel()))
                .shippingCost(round2(normalizeShippingCost(request)))
                .shippingLatitude(normalizeCoordinate(request == null ? null : request.getShippingLatitude()))
                .shippingLongitude(normalizeCoordinate(request == null ? null : request.getShippingLongitude()))
                .currentStatus(Status.PENDING)
                .statusHistory(new ArrayList<>())
                .articles(new ArrayList<>())
                .build();
    }

    private List<OrderArticle> buildOrderArticles(Order order, List<CheckoutLine> lines) {
        return lines.stream()
                .map(line -> (OrderArticle) OrderArticle.builder()
                        .order(order)
                        .itemType(line.itemType())
                        .article(line.article())
                        .ticketEvent(line.ticketEvent())
                        .quantity(line.quantity())
                        .priceAtOrder(line.unitPrice())
                        .build())
                .toList();
    }

    private void appendStatusHistory(Order order, Status status, String comment) {
        StatusHistory history = StatusHistory.builder()
                .order(order)
                .status(status)
                .comment(comment)
                .changedAt(LocalDateTime.now())
                .build();
        order.getStatusHistory().add(history);
    }

    private void clearCartIfNeeded(Cart cart) {
        if (cart != null) {
            cartArticleRepository.deleteByCart(cart);
        }
    }

    private void reserveStock(Long articleId, int quantity) {
        if (!stockRepository.existsByArticleId(articleId)) {
            throw new IllegalArgumentException("Stock introuvable pour l'article " + articleId);
        }
        int updated = stockRepository.reserveIfEnough(articleId, quantity);
        if (updated == 0) {
            throw new IllegalArgumentException("Stock insuffisant pour l'article " + articleId);
        }
    }

    private void releaseReservedStocks(Order order) {
        aggregateOrderQuantitiesByArticle(order).forEach(this::releaseReservedStock);
        aggregateOrderQuantitiesByTicket(order).forEach(ticketInventoryService::releaseReserved);
    }

    private void consumeReservedStocks(Order order) {
        aggregateOrderQuantitiesByArticle(order).forEach(this::consumeReservedStock);
        aggregateOrderQuantitiesByTicket(order).forEach(ticketInventoryService::consumeReserved);
    }

    private Map<Long, Integer> aggregateOrderQuantitiesByArticle(Order order) {
        return order.getArticles().stream()
                .filter(oa -> oa.getItemType() == CommerceItemType.ARTICLE && oa.getArticle() != null)
                .collect(Collectors.groupingBy(
                        oa -> oa.getArticle().getId(),
                        Collectors.summingInt(oa -> normalizeQuantity(oa.getQuantity()))
                ));
    }

    private Map<Long, Integer> aggregateOrderQuantitiesByTicket(Order order) {
        return order.getArticles().stream()
                .filter(oa -> oa.getItemType() == CommerceItemType.TICKET && oa.getTicketEvent() != null)
                .collect(Collectors.groupingBy(
                        oa -> oa.getTicketEvent().getId(),
                        Collectors.summingInt(oa -> normalizeQuantity(oa.getQuantity()))
                ));
    }

    private void releaseReservedStock(Long articleId, Integer quantity) {
        int updated = stockRepository.releaseReserved(articleId, quantity);
        if (updated == 0) {
            throw new IllegalStateException("Stock réservé insuffisant pour annulation, article " + articleId);
        }
    }

    private void consumeReservedStock(Long articleId, Integer quantity) {
        int updated = stockRepository.consumeReserved(articleId, quantity);
        if (updated == 0) {
            throw new IllegalStateException("Stock réservé insuffisant pour confirmation de paiement, article " + articleId);
        }
    }

    private OrderDetailDto mapToDetailDto(Order order) {
        List<OrderItemDto> items = order.getArticles().stream()
                .map(oa -> OrderItemDto.builder()
                        .itemType(oa.getItemType())
                        .articleId(oa.getArticle() == null ? null : oa.getArticle().getId())
                        .ticketEventId(oa.getTicketEvent() == null ? null : oa.getTicketEvent().getId())
                        .articleName(resolveOrderLineName(oa))
                        .quantity(oa.getQuantity())
                        .priceAtOrder(oa.getPriceAtOrder())
                        .subtotal(oa.getPriceAtOrder() * oa.getQuantity())
                        .build())
                .toList();

        List<StatusHistoryDto> statusHistory = order.getStatusHistory().stream()
                .map(sh -> StatusHistoryDto.builder()
                        .id(sh.getId())
                        .status(sh.getStatus())
                        .comment(sh.getComment())
                        .changedAt(sh.getChangedAt())
                        .build())
                .toList();

        return OrderDetailDto.builder()
                .id(order.getId())
                .orderNumber("ORD-" + order.getId())
                .amount(order.getAmount())
                .currency(order.getCurrency())
                .currentStatus(order.getCurrentStatus())
                .createdAt(order.getCreatedAt())
                .deliveryDate(order.getDeliveryDate())
                .trackingNumber(order.getTrackingNumber())
                .shippingAddress(order.getShippingAddress())
                .shippingPhoneNumber(order.getShippingPhoneNumber())
                .shippingMethodCode(order.getShippingMethodCode())
                .shippingMethodLabel(order.getShippingMethodLabel())
                .shippingLatitude(order.getShippingLatitude())
                .shippingLongitude(order.getShippingLongitude())
                .items(items)
                .statusHistory(statusHistory)
                .build();
    }

    private Customer getOrCreateCustomerForCheckout(String customerId) {
        return userService.getCustomerProfile(customerId)
                .orElseGet(() -> userEntityRepository.findById(customerId)
                        .map(user -> userService.getOrCreateCustomerAccount(
                                user.getUserId(),
                                user.getEmail(),
                                user.isEmailVerified(),
                                user.getFirstName(),
                                user.getLastName(),
                                user.getBlocked()
                        ))
                        .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId)));
    }

    private Customer requireExistingCustomer(String customerId) {
        return userService.getCustomerProfile(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private String cartCheckoutKey(CartArticle cartArticle) {
        return checkoutKey(
                cartArticle.getItemType(),
                cartArticle.getArticle() == null ? null : cartArticle.getArticle().getId(),
                cartArticle.getTicketEvent() == null ? null : cartArticle.getTicketEvent().getId()
        );
    }

    private String checkoutKey(CommerceItemType itemType, Long articleId, Long ticketEventId) {
        return (itemType == null ? CommerceItemType.ARTICLE : itemType).name() + "::" + (articleId == null ? 0L : articleId) + "::" + (ticketEventId == null ? 0L : ticketEventId);
    }

    private Double resolveUnitPrice(Article article, TicketEvent ticketEvent) {
        if (article != null && article.getPrice() != null) {
            return calculateGrossAmount(article.getPrice());
        }
        return ticketEvent != null && ticketEvent.getPrice() != null ? ticketEvent.getPrice() : 0d;
    }

    private int normalizeTicketAvailable(TicketEvent ticketEvent) {
        if (ticketEvent == null || ticketEvent.getQuantityAvailable() == null) {
            return 0;
        }
        return Math.max(0, ticketEvent.getQuantityAvailable());
    }

    private String resolveOrderLineName(OrderArticle orderArticle) {
        if (orderArticle.getArticle() != null) {
            return orderArticle.getArticle().getName();
        }
        return orderArticle.getTicketEvent() == null ? "Ticket" : orderArticle.getTicketEvent().getTitle();
    }

    private String resolveOrderLineDescription(OrderArticle orderArticle) {
        if (orderArticle.getArticle() != null) {
            return orderArticle.getArticle().getDescription();
        }
        return orderArticle.getTicketEvent() == null ? null : orderArticle.getTicketEvent().getDescription();
    }

    private String normalizeShippingMethodCode(String value) {
        String trimmed = safeTrim(value);
        if (trimmed.isEmpty()) {
            return "STANDARD";
        }
        return trimmed.toUpperCase(Locale.ROOT);
    }

    private boolean isStrictlyNumeric(String value) {
        return value != null && value.matches("\\d+");
    }

    private double safeDouble(Double value) {
        return value == null ? 0d : value;
    }

    private double round2(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private Double normalizeCoordinate(Double value) {
        if (value == null || !Double.isFinite(value)) {
            return null;
        }
        return value;
    }

    private record CheckoutLine(CommerceItemType itemType, Article article, TicketEvent ticketEvent, int quantity, double unitPrice) {
    }

    private record CheckoutData(List<CheckoutLine> lines, Cart cartToClear) {
    }

    private record CheckoutAggregation(String lineKey, CommerceItemType itemType, Article article, TicketEvent ticketEvent, int quantity) {
    }

    private record PromoApplication(boolean applied, String code, double discountAmount, String message, Discount discount) {
    }

    private record LoyaltyPricing(boolean applied, String tierName, double discountPercent, double discountAmount, int points) {
    }

    private record QuoteComputation(double subTotal, PromoApplication promo, LoyaltyPricing loyalty, double totalAmount) {
    }
}
