package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.CreateStockMovementRequest;
import com.lifeevent.lid.core.dto.StockMovementDto;
import com.lifeevent.lid.core.entity.Produit;
import com.lifeevent.lid.core.entity.Stock;
import com.lifeevent.lid.core.entity.StockMouvement;
import com.lifeevent.lid.core.enums.TypeMouvementStock;
import com.lifeevent.lid.core.repository.ProduitRepository;
import com.lifeevent.lid.core.repository.StockRepository;
import com.lifeevent.lid.core.repository.StockMouvementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StockMovementService {

    private final StockMouvementRepository stockMouvementRepository;
    private final ProduitRepository produitRepository;
    private final StockRepository stockRepository;

    public StockMovementService(StockMouvementRepository stockMouvementRepository,
                                ProduitRepository produitRepository,
                                StockRepository stockRepository) {
        this.stockMouvementRepository = stockMouvementRepository;
        this.produitRepository = produitRepository;
        this.stockRepository = stockRepository;
    }

    @Transactional(readOnly = true)
    public Page<StockMovementDto> listMovements(String sku, TypeMouvementStock type, Pageable pageable) {
        Page<StockMouvement> page;
        boolean hasSku = sku != null && !sku.isBlank();
        if (hasSku && type != null) {
            page = stockMouvementRepository.findBySkuContainingIgnoreCaseAndType(sku, type, pageable);
        } else if (hasSku) {
            page = stockMouvementRepository.findBySkuContainingIgnoreCase(sku, pageable);
        } else if (type != null) {
            page = stockMouvementRepository.findByType(type, pageable);
        } else {
            page = stockMouvementRepository.findAll(pageable);
        }

        return page.map(this::toDto);
    }

    @Transactional
    public StockMovementDto createMovement(CreateStockMovementRequest request) {
        if (request == null || request.getType() == null) {
            throw new RuntimeException("Type de mouvement requis");
        }

        Produit produit = null;
        if (request.getProductId() != null && !request.getProductId().isBlank()) {
            produit = produitRepository.findById(request.getProductId()).orElse(null);
        }
        if (produit == null && request.getSku() != null && !request.getSku().isBlank()) {
            produit = produitRepository.findByReferencePartenaireIgnoreCase(request.getSku()).orElse(null);
        }
        if (produit == null) {
            throw new RuntimeException("Produit introuvable");
        }

        int stockBefore = stockRepository.findByProduit(produit)
                .map(Stock::getQuantiteDisponible)
                .orElse(0);

        TypeMouvementStock type = request.getType();
        Integer qty = request.getQuantity();
        Integer newStock = request.getNewStock();

        int delta;
        int stockAfter;
        if (type == TypeMouvementStock.ENTREE) {
            if (qty == null || qty <= 0) throw new RuntimeException("Quantité d'entrée invalide");
            delta = Math.abs(qty);
            stockAfter = stockBefore + delta;
        } else if (type == TypeMouvementStock.SORTIE) {
            if (qty == null || qty <= 0) throw new RuntimeException("Quantité de sortie invalide");
            delta = -Math.abs(qty);
            stockAfter = stockBefore + delta;
            if (stockAfter < 0) throw new RuntimeException("Stock insuffisant");
        } else {
            if (newStock != null) {
                if (newStock < 0) throw new RuntimeException("Stock invalide");
                stockAfter = newStock;
                delta = stockAfter - stockBefore;
            } else {
                if (qty == null || qty == 0) throw new RuntimeException("Quantité d'ajustement invalide");
                delta = qty;
                stockAfter = stockBefore + delta;
                if (stockAfter < 0) throw new RuntimeException("Stock invalide");
            }
        }

        Stock stock = stockRepository.findByProduit(produit).orElse(null);
        if (stock == null) {
            stock = new Stock();
            stock.setProduit(produit);
            stock.setQuantiteReservee(0);
        }
        stock.setQuantiteDisponible(stockAfter);
        stockRepository.save(stock);

        String sku = produit.getReferencePartenaire();
        if (sku == null || sku.isBlank()) {
            sku = produit.getId();
        }

        StockMouvement mouvement = new StockMouvement();
        mouvement.setProduit(produit);
        mouvement.setSku(sku);
        mouvement.setType(type);
        mouvement.setQuantite(delta);
        mouvement.setStockAvant(stockBefore);
        mouvement.setStockApres(stockAfter);
        mouvement.setReference(request.getReference());
        mouvement = stockMouvementRepository.save(mouvement);

        return toDto(mouvement);
    }

    private StockMovementDto toDto(StockMouvement mouvement) {
        Produit produit = mouvement.getProduit();
        String productName = produit != null ? produit.getNom() : "-";
        return new StockMovementDto(
                mouvement.getId(),
                mouvement.getSku(),
                productName,
                mouvement.getType(),
                mouvement.getQuantite(),
                mouvement.getStockAvant(),
                mouvement.getStockApres(),
                mouvement.getReference(),
                mouvement.getDateCreation()
        );
    }
}
