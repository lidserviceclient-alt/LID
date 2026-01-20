package com.lifeevent.lid.payment.dto;

import com.lifeevent.lid.payment.enums.PaymentOperator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.URL;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO pour créer un paiement
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePaymentRequestDto {
    
    @NotNull(message = "L'ID de la commande est requis")
    private Long orderId;
    
    @NotNull(message = "Le montant est requis")
    @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
    private BigDecimal amount;
    
    @NotBlank(message = "La description est requise")
    @Size(min = 3, max = 255, message = "La description doit contenir entre 3 et 255 caractères")
    private String description;
    
    @NotNull(message = "L'opérateur de paiement est requis")
    private PaymentOperator operator;
    
    @NotBlank(message = "Le nom du client est requis")
    private String customerName;
    
    @NotBlank(message = "L'email du client est requis")
    @Email(message = "L'email doit être valide")
    private String customerEmail;
    
    @NotBlank(message = "Le téléphone du client est requis")
    @Pattern(regexp = "^[0-9+\\-\\s()]{7,}$", message = "Le numéro de téléphone n'est pas valide")
    private String customerPhone;
    
    @NotBlank(message = "L'URL de retour est requise")
    @URL(message = "L'URL de retour doit être valide")
    private String returnUrl;
    
    @NotBlank(message = "L'URL d'annulation est requise")
    @URL(message = "L'URL d'annulation doit être valide")
    private String cancelUrl;
    
    /**
     * Articles du panier/commande (optionnel)
     */
    private List<PaymentItemDto> items;
    
    /**
     * Taxes (optionnel)
     */
    private List<PaymentTaxDto> taxes;
}
