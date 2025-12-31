package com.lifeevent.lid.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;

/**
 * DTO pour les taxes dans une facture de paiement
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTaxDto {
    
    @NotBlank(message = "Le nom de la taxe est requis")
    private String name;
    
    @NotNull(message = "Le montant de la taxe est requis")
    @DecimalMin(value = "0", message = "Le montant de la taxe ne peut pas être négatif")
    private java.math.BigDecimal amount;
}
