package com.lifeevent.lid.payment.example;

import com.lifeevent.lid.payment.dto.CreatePaymentRequestDto;
import com.lifeevent.lid.payment.dto.PaymentItemDto;
import com.lifeevent.lid.payment.dto.PaymentTaxDto;
import com.lifeevent.lid.payment.enums.PaymentOperator;

import java.math.BigDecimal;
import java.util.Arrays;

/**
 * Classe d'exemple pour l'utilisation du module payment
 * Montre comment créer un paiement via l'API
 */
public class PaymentExample {
    
    /**
     * Exemple complet: Créer un paiement avec articles et taxes
     */
    public static CreatePaymentRequestDto createSamplePayment() {
        
        // Article 1: Produit A
        PaymentItemDto item1 = PaymentItemDto.builder()
            .name("Chaussures Croco")
            .quantity(2)
            .unitPrice(new BigDecimal("15000"))
            .totalPrice(new BigDecimal("30000"))
            .description("Chaussures faites en peau de crocodile authentique")
            .build();
        
        // Article 2: Produit B
        PaymentItemDto item2 = PaymentItemDto.builder()
            .name("Chemise Glacée")
            .quantity(1)
            .unitPrice(new BigDecimal("5000"))
            .totalPrice(new BigDecimal("5000"))
            .description("")
            .build();
        
        // Taxe: TVA 18%
        PaymentTaxDto tax = PaymentTaxDto.builder()
            .name("TVA (18%)")
            .amount(new BigDecimal("6300"))
            .build();
        
        // Créer le paiement
        return CreatePaymentRequestDto.builder()
            .orderId(123L)
            .amount(new BigDecimal("42300")) // Total avec taxes
            //.currency("XOF")
            .description("Paiement de 42300 XOF pour article(s) achetés")
            .operator(PaymentOperator.ORANGE_MONEY_CI)
            .customerName("Jean Dupont")
            .customerEmail("jean.dupont@example.com")
            .customerPhone("+225 07 12 34 56 78")
            .returnUrl("https://lid-ecommerce.com/payment/success")
            .cancelUrl("https://lid-ecommerce.com/payment/cancel")
            .items(Arrays.asList(item1, item2))
            .taxes(Arrays.asList(tax))
            .build();
    }
    
    /**
     * Exemple simple: Créer un paiement basique sans articles
     */
    public static CreatePaymentRequestDto createSimplePayment() {
        return CreatePaymentRequestDto.builder()
            .orderId(456L)
            .amount(new BigDecimal("50000"))
            //.currency("XOF")
            .description("Achat de produits")
            .operator(PaymentOperator.WAVE_CI)
            .customerName("Marie Koné")
            .customerEmail("marie.kone@example.com")
            .customerPhone("+225 01 02 03 04 05")
            .returnUrl("https://lid-ecommerce.com/payment/success")
            .cancelUrl("https://lid-ecommerce.com/payment/cancel")
            .build();
    }
    
    /**
     * Exemple pour paiement par carte bancaire
     */
    public static CreatePaymentRequestDto createCardPayment() {
        return CreatePaymentRequestDto.builder()
            .orderId(789L)
            .amount(new BigDecimal("100000"))
            //.currency("XOF")
            .description("Achat premium")
            .operator(PaymentOperator.CARD)
            .customerName("Pierre Bouki")
            .customerEmail("pierre.bouki@example.com")
            .customerPhone("+225 05 06 07 08 09")
            .returnUrl("https://lid-ecommerce.com/payment/success")
            .cancelUrl("https://lid-ecommerce.com/payment/cancel")
            .build();
    }
    
    /**
     * Exemple pour paiement en Sénégal avec Wave
     */
    public static CreatePaymentRequestDto createSenegalPayment() {
        return CreatePaymentRequestDto.builder()
            .orderId(999L)
            .amount(new BigDecimal("25000"))
            //.currency("XOF")
            .description("Commande depuis le Sénégal")
            .operator(PaymentOperator.WAVE_SENEGAL)
            .customerName("Alioune Faye")
            .customerEmail("alioune@example.com")
            .customerPhone("+221 77 45 63 209")
            .returnUrl("https://lid-ecommerce.com/payment/success")
            .cancelUrl("https://lid-ecommerce.com/payment/cancel")
            .build();
    }
    
    // Exemple d'utilisation via curl
    /*
    
    # Créer un paiement
    curl -X POST http://localhost:9000/api/v1/payments \
      -H "Content-Type: application/json" \
      -d '{
        "orderId": 123,
        "amount": 42300,
        "currency": "XOF",
        "description": "Achat de produits",
        "operator": "ORANGE_MONEY_CI",
        "customerName": "Jean Dupont",
        "customerEmail": "jean@example.com",
        "customerPhone": "+225 01 02 03 04 05",
        "returnUrl": "https://lid-ecommerce.com/payment/success",
        "cancelUrl": "https://lid-ecommerce.com/payment/cancel",
        "items": [
          {
            "name": "Produit A",
            "quantity": 2,
            "unitPrice": 15000,
            "totalPrice": 30000,
            "description": "Description"
          }
        ],
        "taxes": [
          {
            "name": "TVA (18%)",
            "amount": 6300
          }
        ]
      }'
    
    # Vérifier le statut d'un paiement
    curl -X GET http://localhost:9000/api/v1/payments/verify/{invoiceToken}
    
    # Récupérer les détails d'un paiement
    curl -X GET http://localhost:9000/api/v1/payments/{paymentId}
    
    # Obtenir les opérateurs pour la Côte d'Ivoire
    curl -X GET http://localhost:9000/api/v1/payments/operators/CI
    
    # Demander un remboursement
    curl -X POST http://localhost:9000/api/v1/refunds \
      -H "Content-Type: application/json" \
      -d '{
        "paymentId": 1,
        "amount": 42300,
        "reason": "Client insatisfait du produit"
      }'
    
    */
}
