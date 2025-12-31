package com.lifeevent.lid.payment.dto;

import lombok.*;

import jakarta.validation.constraints.*;

/**
 * DTO pour les demandes de remboursement
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequestDto {
    
    @NotNull(message = "L'ID du paiement est requis")
    private Long paymentId;
    
    @NotNull(message = "Le montant du remboursement est requis")
    @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
    private java.math.BigDecimal amount;
    
    @NotBlank(message = "Le motif du remboursement est requis")
    @Size(min = 5, max = 500, message = "Le motif doit contenir entre 5 et 500 caractères")
    private String reason;
}
