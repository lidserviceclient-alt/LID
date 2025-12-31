package com.lifeevent.lid.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;

/**
 * DTO pour un article dans une facture de paiement
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentItemDto {
    
    @NotBlank(message = "Le nom de l'article est requis")
    private String name;
    
    @NotNull(message = "La quantité est requise")
    @Min(value = 1, message = "La quantité doit être au moins 1")
    private Integer quantity;
    
    @NotNull(message = "Le prix unitaire est requis")
    @DecimalMin(value = "0.01", message = "Le prix unitaire doit être supérieur à 0")
    private java.math.BigDecimal unitPrice;
    
    @NotNull(message = "Le prix total est requis")
    @DecimalMin(value = "0.01", message = "Le prix total doit être supérieur à 0")
    private java.math.BigDecimal totalPrice;
    
    private String description;
}
