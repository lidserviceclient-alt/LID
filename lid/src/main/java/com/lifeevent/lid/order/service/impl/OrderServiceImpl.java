package com.lifeevent.lid.order.service.impl;

import com.lifeevent.lid.cart.entity.Cart;
import com.lifeevent.lid.cart.entity.CartArticle;
import com.lifeevent.lid.cart.repository.CartArticleRepository;
import com.lifeevent.lid.cart.repository.CartRepository;
import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.payment.config.PaydunyaProperties;
import com.lifeevent.lid.payment.dto.CreatePaymentRequestDto;
import com.lifeevent.lid.payment.dto.PaymentItemDto;
import com.lifeevent.lid.payment.dto.PaymentResponseDto;
import com.lifeevent.lid.payment.dto.PaymentTaxDto;
import com.lifeevent.lid.payment.enums.PaymentOperator;
import com.lifeevent.lid.payment.service.PaymentService;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import com.lifeevent.lid.core.dto.OrderQuoteResponse;
import com.lifeevent.lid.core.service.LoyaltyService;
import com.lifeevent.lid.core.entity.CodePromo;
import com.lifeevent.lid.core.entity.CodePromoUtilisation;
import com.lifeevent.lid.core.entity.Produit;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.enums.CibleCodePromo;
import com.lifeevent.lid.core.enums.RoleUtilisateur;
import com.lifeevent.lid.core.enums.StatutProduit;
import com.lifeevent.lid.core.repository.CodePromoRepository;
import com.lifeevent.lid.core.repository.CodePromoUtilisationRepository;
import com.lifeevent.lid.core.repository.ProduitRepository;
import com.lifeevent.lid.core.repository.StockRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import com.lifeevent.lid.order.dto.*;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.entity.OrderArticle;
import com.lifeevent.lid.order.entity.StatusHistory;
import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.order.repository.OrderArticleRepository;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Locale;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderArticleRepository orderArticleRepository;
    private final CartRepository cartRepository;
    private final CartArticleRepository cartArticleRepository;
    private final CustomerRepository customerRepository;
    private final ArticleRepository articleRepository;
    private final PaymentService paymentService;
    private final PaydunyaProperties paydunyaProperties;
    private final CodePromoRepository codePromoRepository;
    private final CodePromoUtilisationRepository codePromoUtilisationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ProduitRepository produitRepository;
    private final LoyaltyService loyaltyService;
    private final StockRepository coreStockRepository;
    private final com.lifeevent.lid.stock.repository.StockRepository articleStockRepository;
    
    // Bridge to Core Logistics
    private final com.lifeevent.lid.core.repository.CommandeRepository commandeRepository;
    private final com.lifeevent.lid.core.repository.CommandeLigneRepository commandeLigneRepository;
    private final com.lifeevent.lid.core.repository.LivraisonRepository livraisonRepository;

    private record PromoApplication(boolean applied, String code, BigDecimal discountAmount, String message, CodePromo promo, Utilisateur utilisateur) {
    }

    private PromoApplication applyPromoCode(String promoCode, BigDecimal subTotal, String email, String phone) {
        String code = promoCode != null ? promoCode.trim() : "";
        if (code.isBlank()) {
            return new PromoApplication(false, null, BigDecimal.ZERO, null, null, null);
        }
        code = code.toUpperCase(Locale.ROOT);

        CodePromo promo = codePromoRepository.findByCodeIgnoreCase(code).orElse(null);
        if (promo == null) {
            return new PromoApplication(false, code, BigDecimal.ZERO, "Code promo introuvable", null, null);
        }
        if (promo.getEstActif() == null || !promo.getEstActif()) {
            return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Code promo inactif", null, null);
        }

        LocalDateTime now = LocalDateTime.now();
        if (promo.getDateDebut() != null && now.isBefore(promo.getDateDebut())) {
            return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Code promo pas encore actif", null, null);
        }
        if (promo.getDateFin() != null && now.isAfter(promo.getDateFin())) {
            return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Code promo expiré", null, null);
        }

        if (promo.getMontantMinCommande() != null && subTotal.compareTo(promo.getMontantMinCommande()) < 0) {
            return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Montant minimum non atteint", null, null);
        }

        Utilisateur utilisateur = null;
        String safeEmail = email != null ? email.trim() : "";
        if (!safeEmail.isBlank()) {
            utilisateur = utilisateurRepository.findByEmail(safeEmail).orElse(null);
            if (utilisateur == null) {
                utilisateur = new Utilisateur();
                utilisateur.setEmail(safeEmail);
                utilisateur.setEmailVerifie(Boolean.FALSE);
                utilisateur.setRole(RoleUtilisateur.CLIENT);
                if (phone != null && !phone.trim().isBlank()) {
                    utilisateur.setTelephone(phone.trim());
                }
                utilisateur = utilisateurRepository.save(utilisateur);
            }
        }

        if (promo.getUsageMax() != null && promo.getUsageMax() > 0) {
            long used = codePromoUtilisationRepository.countByCodePromoId(promo.getId());
            if (used >= promo.getUsageMax()) {
                return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Code promo épuisé", null, utilisateur);
            }
        }

        int perUserMax = promo.getUsageMaxParUtilisateur() != null ? promo.getUsageMaxParUtilisateur() : 1;
        if (perUserMax > 0 && utilisateur != null) {
            long usedByUser = codePromoUtilisationRepository.countByCodePromoIdAndUtilisateurId(promo.getId(), utilisateur.getId());
            if (usedByUser >= perUserMax) {
                return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Limite d’utilisation atteinte pour ce client", null, utilisateur);
            }
        }

        CibleCodePromo cible = promo.getCible() != null ? promo.getCible() : CibleCodePromo.GLOBAL;
        if (cible == CibleCodePromo.UTILISATEUR) {
            if (utilisateur == null || promo.getUtilisateur() == null || !promo.getUtilisateur().getId().equals(utilisateur.getId())) {
                return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Code promo non applicable à ce client", null, utilisateur);
            }
        }
        if (cible == CibleCodePromo.BOUTIQUE) {
            return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Code promo non applicable à cette commande", null, utilisateur);
        }

        BigDecimal percent = promo.getPourcentage() != null ? promo.getPourcentage() : BigDecimal.ZERO;
        BigDecimal discount = subTotal.multiply(percent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        if (discount.compareTo(BigDecimal.ZERO) <= 0) {
            return new PromoApplication(false, promo.getCode(), BigDecimal.ZERO, "Réduction nulle", null, utilisateur);
        }
        if (discount.compareTo(subTotal) > 0) discount = subTotal;

        return new PromoApplication(true, promo.getCode(), discount, "Code promo appliqué", promo, utilisateur);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderQuoteResponse quoteCheckout(String customerId, CheckoutRequestDto request) {
        if (request == null) {
            throw new IllegalArgumentException("Requête invalide");
        }

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            validateStockForCheckoutItems(request.getItems());
        } else {
            Cart cart = cartRepository.findByCustomer_userId(customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", customerId.toString()));
            List<CartArticle> cartItems = cartArticleRepository.findByCart(cart);
            if (cartItems.isEmpty()) {
                throw new IllegalArgumentException("Le panier est vide");
            }
            validateStockForCartItems(cartItems);
        }

        BigDecimal subTotal = BigDecimal.ZERO;
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CheckoutItemDto item : request.getItems()) {
                int qty = item == null || item.getQuantity() == null ? 0 : item.getQuantity();
                if (qty <= 0) continue;
                BigDecimal unit = resolveCheckoutUnitPrice(item);
                if (unit == null) continue;
                subTotal = subTotal.add(unit.multiply(BigDecimal.valueOf(qty)));
            }
        } else {
            Cart cart = cartRepository.findByCustomer_userId(customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", customerId.toString()));
            List<CartArticle> cartItems = cartArticleRepository.findByCart(cart);
            if (cartItems.isEmpty()) {
                throw new IllegalArgumentException("Le panier est vide");
            }
            for (CartArticle cartItem : cartItems) {
                double unit = cartItem.getArticle().getPrice() == null ? 0d : cartItem.getArticle().getPrice();
                subTotal = subTotal.add(BigDecimal.valueOf(unit).multiply(BigDecimal.valueOf(cartItem.getQuantity())));
            }
        }

        if (subTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le panier est vide");
        }

        PromoApplication promo = applyPromoCode(request.getPromoCode(), subTotal, request.getEmail(), request.getPhone());
        LoyaltyService.LoyaltyPricing loyaltyPricing = loyaltyService.quotePricingForEmail(request.getEmail(), subTotal, promo.applied());
        BigDecimal total = subTotal.subtract(promo.discountAmount()).subtract(loyaltyPricing.discountAmount());
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;

        return new OrderQuoteResponse(
                subTotal.setScale(2, RoundingMode.HALF_UP),
                promo.discountAmount().setScale(2, RoundingMode.HALF_UP),
                loyaltyPricing.discountAmount().setScale(2, RoundingMode.HALF_UP),
                total.setScale(2, RoundingMode.HALF_UP),
                promo.applied(),
                promo.code(),
                promo.message(),
                loyaltyPricing.applied(),
                loyaltyPricing.tierName(),
                loyaltyPricing.discountPercent().setScale(2, RoundingMode.HALF_UP),
                loyaltyPricing.points()
        );
    }
    
    @Override
    public CheckoutResponseDto checkout(String customerId, CheckoutRequestDto request) {
        log.info("Initiation du checkout pour le client: {}", customerId);
        
        // Vérifier le client
        Customer customer = customerRepository.findById(customerId).orElseGet(() -> {
            String email = request.getEmail();
            if (email == null || email.isBlank()) {
                email = customerId + "@unknown.local";
            }
            Customer created = Customer.builder()
                    .userId(customerId)
                    .email(email)
                    .emailVerified(false)
                    .build();
            return customerRepository.save(created);
        });

        List<OrderArticle> orderArticles = new ArrayList<>();
        BigDecimal subTotal = BigDecimal.ZERO;
        String currency = (request.getCurrency() == null || request.getCurrency().isBlank()) ? "XOF" : request.getCurrency();

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            validateStockForCheckoutItems(request.getItems());
            for (CheckoutItemDto item : request.getItems()) {
                int qty = item == null || item.getQuantity() == null ? 0 : item.getQuantity();
                if (qty <= 0) continue;
                Article article = resolveCheckoutArticle(item);
                if (article == null) continue;
                double unit = article.getPrice() == null ? 0d : article.getPrice();
                subTotal = subTotal.add(BigDecimal.valueOf(unit).multiply(BigDecimal.valueOf(qty)));
                OrderArticle oa = OrderArticle.builder()
                        .article(article)
                        .quantity(qty)
                        .priceAtOrder(unit)
                        .build();
                orderArticles.add(oa);
            }
        } else {
            Cart cart = cartRepository.findByCustomer_userId(customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cart", "customerId", customerId.toString()));
            List<CartArticle> cartItems = cartArticleRepository.findByCart(cart);
            if (cartItems.isEmpty()) {
                throw new IllegalArgumentException("Le panier est vide");
            }
            validateStockForCartItems(cartItems);
            for (CartArticle cartItem : cartItems) {
                double unit = cartItem.getArticle().getPrice() == null ? 0d : cartItem.getArticle().getPrice();
                subTotal = subTotal.add(BigDecimal.valueOf(unit).multiply(BigDecimal.valueOf(cartItem.getQuantity())));
                OrderArticle oa = OrderArticle.builder()
                        .article(cartItem.getArticle())
                        .quantity(cartItem.getQuantity())
                        .priceAtOrder(unit)
                        .build();
                orderArticles.add(oa);
            }
            cartArticleRepository.deleteByCart(cart);
        }

        if (orderArticles.isEmpty() || subTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le panier est vide");
        }

        PromoApplication promo = applyPromoCode(request.getPromoCode(), subTotal, request.getEmail(), request.getPhone());
        if (request.getPromoCode() != null && !request.getPromoCode().trim().isBlank() && !promo.applied()) {
            throw new IllegalArgumentException(promo.message() != null ? promo.message() : "Code promo invalide");
        }

        LoyaltyService.LoyaltyPricing loyaltyPricing = loyaltyService.quotePricingForEmail(request.getEmail(), subTotal, promo.applied());

        BigDecimal shippingCost = BigDecimal.valueOf(request.getShippingCost() != null ? request.getShippingCost() : 0d);
        if (shippingCost.compareTo(BigDecimal.ZERO) < 0) shippingCost = BigDecimal.ZERO;

        BigDecimal total = subTotal.subtract(promo.discountAmount()).subtract(loyaltyPricing.discountAmount()).add(shippingCost);
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;

        Order order = Order.builder()
            .customer(customer)
            .amount(total.setScale(2, RoundingMode.HALF_UP).doubleValue())
            .currency(currency)
            .currentStatus(Status.PENDING)
            .statusHistory(new ArrayList<>())
            .articles(new ArrayList<>())
            .build();
        
        Order savedOrder = orderRepository.save(order);
        
        for (OrderArticle oa : orderArticles) {
            oa.setOrder(savedOrder);
            orderArticleRepository.save(oa);
            savedOrder.getArticles().add(oa);
        }
        
        // Ajouter un statut à l'historique
        StatusHistory history = StatusHistory.builder()
            .order(savedOrder)
            .status(Status.PENDING)
            .comment("Commande créée - En attente de paiement")
            .changedAt(LocalDateTime.now())
            .build();
        savedOrder.getStatusHistory().add(history);
        
        orderRepository.save(savedOrder);

        // --- BRIDGE TO CORE LOGISTICS ---
        try {
            // Find Core Utilisateur
            com.lifeevent.lid.core.entity.Utilisateur coreUser = utilisateurRepository.findById(customer.getUserId()).orElse(null);
            if (coreUser == null && customer.getEmail() != null) {
                coreUser = utilisateurRepository.findByEmail(customer.getEmail()).orElse(null);
            }
            
            if (coreUser != null) {
                com.lifeevent.lid.core.entity.Commande coreCmd = new com.lifeevent.lid.core.entity.Commande();
                coreCmd.setId("ORD-" + savedOrder.getId());
                coreCmd.setClient(coreUser);
                coreCmd.setMontantTotal(BigDecimal.valueOf(savedOrder.getAmount()));
                coreCmd.setDevise(currency);
                coreCmd.setStatut(com.lifeevent.lid.core.enums.StatutCommande.CREEE);
                coreCmd.setDateCreation(LocalDateTime.now());
                coreCmd = commandeRepository.save(coreCmd);

                for (OrderArticle oa : orderArticles) {
                    com.lifeevent.lid.core.entity.CommandeLigne line = new com.lifeevent.lid.core.entity.CommandeLigne();
                    line.setCommande(coreCmd);
                    
                    // Try to link product via reference
                    if (oa.getArticle() != null) {
                        String ref = oa.getArticle().getReferenceProduitPartenaire();
                        if (ref != null) {
                            com.lifeevent.lid.core.entity.Produit p = produitRepository.findByReferencePartenaireIgnoreCase(ref).orElse(null);
                            line.setProduit(p);
                        }
                    }
                    line.setQuantite(oa.getQuantity());
                    line.setPrixUnitaire(BigDecimal.valueOf(oa.getPriceAtOrder()));
                    commandeLigneRepository.save(line);
                }

                com.lifeevent.lid.core.entity.Livraison livraison = new com.lifeevent.lid.core.entity.Livraison();
                livraison.setCommande(coreCmd);
                livraison.setStatut(com.lifeevent.lid.core.enums.StatutLivraison.EN_PREPARATION);
                livraison.setCoutLivraison(shippingCost);
                // Save shipping info
                livraison.setAdresseLivraison(request.getShippingAddress());
                livraison.setTelephoneLivraison(request.getPhone());
                livraisonRepository.save(livraison);
                
                log.info("Core Commande & Livraison created for Order {}", savedOrder.getId());
            } else {
                log.warn("Skipping Core Commande creation: Core User not found for Customer {}", customer.getUserId());
            }
        } catch (Exception e) {
            log.error("Failed to bridge Order {} to Core Logistics", savedOrder.getId(), e);
            // Don't fail the checkout, just log
        }
        // --------------------------------

        if (promo.applied() && promo.promo() != null && promo.utilisateur() != null && promo.discountAmount().compareTo(BigDecimal.ZERO) > 0) {
            CodePromoUtilisation utilisation = new CodePromoUtilisation();
            utilisation.setCodePromo(promo.promo());
            utilisation.setUtilisateur(promo.utilisateur());
            utilisation.setCommande(null);
            utilisation.setMontantReduction(promo.discountAmount().setScale(2, RoundingMode.HALF_UP));
            codePromoUtilisationRepository.save(utilisation);
        }

        String fullName = java.util.stream.Stream.of(customer.getFirstName(), customer.getLastName())
                .filter(v -> v != null && !v.isBlank())
                .collect(Collectors.joining(" "));
        if (fullName.isBlank()) fullName = customer.getEmail();
        String email = request.getEmail() != null && !request.getEmail().isBlank() ? request.getEmail() : customer.getEmail();
        String phone = request.getPhone() == null ? "" : request.getPhone().trim();
        if (phone.isBlank()) {
            throw new IllegalArgumentException("Numéro de téléphone requis");
        }

        List<PaymentItemDto> paymentItems = savedOrder.getArticles().stream()
                .map(oa -> PaymentItemDto.builder()
                        .name(oa.getArticle().getName())
                        .quantity(oa.getQuantity())
                        .unitPrice(BigDecimal.valueOf(oa.getPriceAtOrder()))
                        .totalPrice(BigDecimal.valueOf(oa.getPriceAtOrder() * oa.getQuantity()))
                        .description(oa.getArticle().getDescription())
                        .build())
                .toList();

        PaymentTaxDto tva = PaymentTaxDto.builder()
                .name("TVA (18%)")
                .amount(BigDecimal.valueOf(Math.round(savedOrder.getAmount() - (savedOrder.getAmount() / 1.18d))))
                .build();

        String returnUrl = request.getReturnUrl() != null && !request.getReturnUrl().isBlank()
                ? request.getReturnUrl()
                : paydunyaProperties.getReturnUrl();
        String cancelUrl = request.getCancelUrl() != null && !request.getCancelUrl().isBlank()
                ? request.getCancelUrl()
                : paydunyaProperties.getCancelUrl();

        CreatePaymentRequestDto paymentRequest = CreatePaymentRequestDto.builder()
                .orderId(savedOrder.getId())
                .amount(BigDecimal.valueOf(savedOrder.getAmount()))
                .description("Paiement commande ORD-" + savedOrder.getId())
                .operator(PaymentOperator.CARD_CI)
                .customerName(fullName)
                .customerEmail(email)
                .customerPhone(phone)
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .items(paymentItems)
                .taxes(List.of(tva))
                .build();

        String provider = request.getPaymentProvider() == null ? "" : request.getPaymentProvider().trim();
        PaymentResponseDto payment = "LOCAL".equalsIgnoreCase(provider)
                ? paymentService.createLocalPayment(paymentRequest)
                : paymentService.createPayment(paymentRequest);

        return CheckoutResponseDto.builder()
                .orderId(savedOrder.getId())
                .amount(savedOrder.getAmount())
                .paymentUrl(payment.getPaymentUrl())
                .invoiceToken(payment.getInvoiceToken())
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<OrderDetailDto> getOrderById(Long orderId) {
        log.info("Récupération de la commande: {}", orderId);
        return orderRepository.findById(orderId).map(this::mapToDetailDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<OrderDetailDto> getOrdersByCustomer(String customerId, int page, int size) {
        log.info("Récupération des commandes du client: {}", customerId);
        
        // Vérifier le client
        customerRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId.toString()));
        
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByCustomer_UserId(customerId, pageable)
            .stream()
            .map(this::mapToDetailDto)
            .collect(Collectors.toList());
    }
    
    @Override
    public void updateOrderStatus(Long orderId, Status newStatus, String comment) {
        log.info("Mise à jour du statut de la commande {}: {}", orderId, newStatus);
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));
        
        // Ajouter à l'historique
        StatusHistory history = StatusHistory.builder()
            .order(order)
            .status(newStatus)
            .comment(comment)
            .changedAt(LocalDateTime.now())
            .build();
        
        order.getStatusHistory().add(history);
        order.setCurrentStatus(newStatus);
        
        orderRepository.save(order);
    }
    
    @Override
    public void confirmPayment(Long orderId) {
        log.info("Confirmation du paiement pour la commande: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));
        
        // Vérifier le statut actuel
        if (order.getCurrentStatus() != Status.PENDING) {
            throw new IllegalArgumentException("La commande n'est pas en attente de paiement");
        }
        
        // Mettre à jour le statut
        updateOrderStatus(orderId, Status.PAID, "Paiement confirmé");
    }
    
    @Override
    public void cancelOrder(Long orderId, String reason) {
        log.info("Annulation de la commande: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId.toString()));
        
        // Mettre à jour le statut
        updateOrderStatus(orderId, Status.CANCELED, reason);
    }

    private Article resolveCheckoutArticle(CheckoutItemDto item) {
        if (item == null) {
            return null;
        }
        Long articleId = item.getArticleId();
        if (articleId != null) {
            return articleRepository.findById(articleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Article", "id", String.valueOf(articleId)));
        }
        String reference = item.getReferenceProduitPartenaire();
        if (reference != null && !reference.isBlank()) {
            Article existing = articleRepository.findByReferenceProduitPartenaire(reference).orElse(null);
            if (existing != null) {
                return existing;
            }

            Produit produit = produitRepository.findByReferencePartenaireIgnoreCase(reference)
                    .orElseThrow(() -> new ResourceNotFoundException("Article", "referenceProduitPartenaire", reference));

            Article created = Article.builder()
                    .referenceProduitPartenaire(reference)
                    .name(produit.getNom() != null ? produit.getNom() : reference)
                    .description(produit.getDescription())
                    .img(resolveMainProductImage(produit))
                    .brand(produit.getMarque())
                    .price(produit.getPrix() != null ? produit.getPrix().doubleValue() : 0d)
                    .vat(produit.getTva() != null ? produit.getTva().floatValue() : null)
                    .status(mapProductStatus(produit.getStatut()))
                    .referencePartner(produit.getBoutique() != null && produit.getBoutique().getPartenaire() != null
                            ? produit.getBoutique().getPartenaire().getId()
                            : null)
                    .isFeatured(Boolean.TRUE.equals(produit.getIsFeatured()))
                    .isBestSeller(Boolean.TRUE.equals(produit.getIsBestSeller()))
                    .build();

            return articleRepository.save(created);
        }
        return null;
    }

    private void validateStockForCheckoutItems(List<CheckoutItemDto> items) {
        Map<Long, Integer> qtyByArticleId = new HashMap<>();
        Map<String, Integer> qtyByReference = new HashMap<>();

        for (CheckoutItemDto item : items) {
            int qty = item == null || item.getQuantity() == null ? 0 : item.getQuantity();
            if (qty <= 0) continue;

            Long articleId = item.getArticleId();
            if (articleId != null) {
                qtyByArticleId.put(articleId, (qtyByArticleId.getOrDefault(articleId, 0) + qty));
                continue;
            }

            String ref = item.getReferenceProduitPartenaire();
            if (ref != null && !ref.trim().isBlank()) {
                String key = ref.trim();
                qtyByReference.put(key, (qtyByReference.getOrDefault(key, 0) + qty));
            }
        }

        for (var entry : qtyByArticleId.entrySet()) {
            Long articleId = entry.getKey();
            int needed = entry.getValue() == null ? 0 : entry.getValue();
            if (needed <= 0) continue;

            Article article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Article", "id", String.valueOf(articleId)));
            if (article.getStatus() != null && article.getStatus() != ArticleStatus.ACTIVE) {
                throw new IllegalArgumentException("Article indisponible");
            }
            int available = articleStockRepository.sumAvailableByArticleId(articleId);
            if (available < needed) {
                throw new IllegalArgumentException("Stock insuffisant");
            }
        }

        for (var entry : qtyByReference.entrySet()) {
            String ref = entry.getKey();
            int needed = entry.getValue() == null ? 0 : entry.getValue();
            if (needed <= 0) continue;

            Produit produit = produitRepository.findByReferencePartenaireIgnoreCase(ref)
                    .orElseThrow(() -> new ResourceNotFoundException("Produit", "reference", ref));
            com.lifeevent.lid.core.entity.Stock stock = coreStockRepository.findByProduit(produit).orElse(null);
            int available = stock != null && stock.getQuantiteDisponible() != null ? stock.getQuantiteDisponible() : 0;
            if (available < needed) {
                throw new IllegalArgumentException("Stock insuffisant");
            }
        }
    }

    private void validateStockForCartItems(List<CartArticle> cartItems) {
        Map<Long, Integer> qtyByArticleId = new HashMap<>();
        for (CartArticle cartItem : cartItems) {
            if (cartItem == null || cartItem.getArticle() == null || cartItem.getArticle().getId() == null) continue;
            int qty = cartItem.getQuantity() == null ? 0 : cartItem.getQuantity();
            if (qty <= 0) continue;
            Long id = cartItem.getArticle().getId();
            qtyByArticleId.put(id, qtyByArticleId.getOrDefault(id, 0) + qty);
        }

        for (var entry : qtyByArticleId.entrySet()) {
            Long articleId = entry.getKey();
            int needed = entry.getValue() == null ? 0 : entry.getValue();
            if (needed <= 0) continue;

            Article article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Article", "id", String.valueOf(articleId)));
            if (article.getStatus() != null && article.getStatus() != ArticleStatus.ACTIVE) {
                throw new IllegalArgumentException("Article indisponible");
            }
            int available = articleStockRepository.sumAvailableByArticleId(articleId);
            if (available < needed) {
                throw new IllegalArgumentException("Stock insuffisant");
            }
        }
    }

    private BigDecimal resolveCheckoutUnitPrice(CheckoutItemDto item) {
        if (item == null) return null;

        Long articleId = item.getArticleId();
        if (articleId != null) {
            Article article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Article", "id", String.valueOf(articleId)));
            double unit = article.getPrice() == null ? 0d : article.getPrice();
            return BigDecimal.valueOf(unit);
        }

        String reference = item.getReferenceProduitPartenaire();
        if (reference == null || reference.isBlank()) {
            return null;
        }

        Article article = articleRepository.findByReferenceProduitPartenaire(reference).orElse(null);
        if (article != null) {
            double unit = article.getPrice() == null ? 0d : article.getPrice();
            return BigDecimal.valueOf(unit);
        }

        Produit produit = produitRepository.findByReferencePartenaireIgnoreCase(reference).orElse(null);
        if (produit != null) {
            return produit.getPrix() != null ? produit.getPrix() : BigDecimal.ZERO;
        }

        throw new ResourceNotFoundException("Article", "referenceProduitPartenaire", reference);
    }

    private static ArticleStatus mapProductStatus(StatutProduit statut) {
        if (statut == null) return ArticleStatus.ACTIVE;
        return switch (statut) {
            case ACTIF -> ArticleStatus.ACTIVE;
            case BROUILLON -> ArticleStatus.INACTIVE;
            case ARCHIVE -> ArticleStatus.DISCONTINUED;
        };
    }

    private static String resolveMainProductImage(Produit produit) {
        if (produit == null) return null;
        var images = produit.getImages();
        if (images == null || images.isEmpty()) return null;

        com.lifeevent.lid.core.entity.ProduitImage principal = null;
        for (var img : images) {
            if (img != null && Boolean.TRUE.equals(img.getEstPrincipale())) {
                principal = img;
                break;
            }
        }
        var chosen = principal != null ? principal : images.get(0);
        String url = chosen != null ? chosen.getUrl() : null;
        if (url == null) return null;
        String trimmed = url.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
     
    /**
     * Mapper une entité Order vers un DTO OrderDetailDto
     */
    private OrderDetailDto mapToDetailDto(Order order) {
        List<OrderItemDto> items = order.getArticles().stream()
            .map(oa -> OrderItemDto.builder()
                .articleId(oa.getArticle().getId())
                .articleName(oa.getArticle().getName())
                .quantity(oa.getQuantity())
                .priceAtOrder(oa.getPriceAtOrder())
                .subtotal(oa.getPriceAtOrder() * oa.getQuantity())
                .build())
            .collect(Collectors.toList());
        
        List<StatusHistoryDto> statusHistory = order.getStatusHistory().stream()
            .map(sh -> StatusHistoryDto.builder()
                .id(sh.getId())
                .status(sh.getStatus())
                .comment(sh.getComment())
                .changedAt(sh.getChangedAt())
                .build())
            .collect(Collectors.toList());
        
        return OrderDetailDto.builder()
            .id(order.getId())
            .orderNumber("ORD-" + order.getId())
            .amount(order.getAmount())
            .currency(order.getCurrency())
            .currentStatus(order.getCurrentStatus())
            .createdAt(order.getCreatedAt())
            .deliveryDate(order.getDeliveryDate())
            .trackingNumber(order.getTrackingNumber())
            .items(items)
            .statusHistory(statusHistory)
            .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isOwnedByCurrentUser(Long orderId) {
        log.debug("Vérification de ownership pour la commande: {}", orderId);
        String currentUserId = SecurityUtils.getCurrentUserId();
        
        if (currentUserId == null) {
            log.warn("Tentative de vérification d'ownership sans utilisateur authentifié");
            return false;
        }
        
        return orderRepository.findById(orderId)
            .map(order -> currentUserId.equals(order.getCustomer().getUserId()))
            .orElse(false);
    }
}
