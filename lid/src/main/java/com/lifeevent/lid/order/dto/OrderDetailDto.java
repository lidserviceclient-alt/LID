package com.lifeevent.lid.order.dto;

import com.lifeevent.lid.order.enumeration.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO pour les détails d'une commande
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailDto {
    
    private Long id;
    
    private String orderNumber;
    
    private Double amount;
    
    private String currency;
    
    private Status currentStatus;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime deliveryDate;
    
    private String trackingNumber;

    private String shippingAddress;

    private Double shippingLatitude;

    private Double shippingLongitude;
    
    /**
     * Articles commandés
     */
    private List<OrderItemDto> items;
    
    /**
     * Historique des changements de statut
     */
    private List<StatusHistoryDto> statusHistory;
}
