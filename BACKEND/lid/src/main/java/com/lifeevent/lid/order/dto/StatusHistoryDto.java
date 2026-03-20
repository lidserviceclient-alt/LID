package com.lifeevent.lid.order.dto;

import com.lifeevent.lid.order.enumeration.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour l'historique des statuts d'une commande
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusHistoryDto {
    
    private Long id;
    
    private Status status;
    
    private String comment;
    
    private LocalDateTime changedAt;
}
