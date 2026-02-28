package com.lifeevent.lid.stock.service;

import com.lifeevent.lid.stock.dto.StockDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

/**
 * Service pour la gestion des stocks
 */
public interface StockService {
    
    /**
     * Créer un stock
     */
    StockDto createStock(StockDto dto);
    
    /**
     * Récupérer un stock par ID
     */
    Optional<StockDto> getStockById(Long id);
    
    /**
     * Récupérer tous les stocks
     */
    Page<StockDto> getAllStocks(Pageable pageable);
    
    /**
     * Récupérer les stocks par article
     */
    Page<StockDto> getStocksByArticleId(Long articleId, Pageable pageable);
    
    /**
     * Mettre à jour un stock
     */
    StockDto updateStock(Long id, StockDto dto);
    
    /**
     * Supprimer un stock
     */
    void deleteStock(Long id);
    
    /**
     * Réserver une quantité (paiement en cours)
     */
    void reserveQuantity(Long stockId, Integer quantity);
    
    /**
     * Annuler une réservation
     */
    void cancelReservation(Long stockId, Integer quantity);
    
    /**
     * Confirmer une vente (consommer le stock)
     */
    void confirmSale(Long stockId, Integer quantity);
    
    /**
     * Obtenir la quantité disponible à la vente
     */
    Integer getAvailableQuantity(Long stockId);
}
