package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.BulkDeleteProductsResponse;
import com.lifeevent.lid.core.dto.CreateProductRequest;
import com.lifeevent.lid.core.dto.ProductSummaryDto;
import com.lifeevent.lid.core.dto.UpdateProductRequest;
import com.lifeevent.lid.core.entity.*;
import com.lifeevent.lid.core.enums.StatutProduit;
import com.lifeevent.lid.core.enums.TypeMouvementStock;
import com.lifeevent.lid.core.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class ProductService {

    private final ProduitRepository produitRepository;
    private final StockRepository stockRepository;
    private final BoutiqueRepository boutiqueRepository;
    private final CategorieRepository categorieRepository;
    private final ProduitImageRepository produitImageRepository;
    private final StockMouvementRepository stockMouvementRepository;

    public ProductService(ProduitRepository produitRepository, 
                          StockRepository stockRepository,
                          BoutiqueRepository boutiqueRepository,
                          CategorieRepository categorieRepository,
                          ProduitImageRepository produitImageRepository,
                          StockMouvementRepository stockMouvementRepository) {
        this.produitRepository = produitRepository;
        this.stockRepository = stockRepository;
        this.boutiqueRepository = boutiqueRepository;
        this.categorieRepository = categorieRepository;
        this.produitImageRepository = produitImageRepository;
        this.stockMouvementRepository = stockMouvementRepository;
    }

    public Page<ProductSummaryDto> listProducts(Pageable pageable) {
        return produitRepository.findByStatutNot(StatutProduit.ARCHIVE, pageable).map(this::toSummary);
    }

    @Transactional
    public ProductSummaryDto createProduct(CreateProductRequest request) {
        // 1. Resolve Boutique (default to first found if not specified)
        Boutique boutique = boutiqueRepository.findAll().stream().findFirst()
            .orElseThrow(() -> new RuntimeException("Aucune boutique trouvée. Veuillez en créer une d'abord."));

        // 2. Resolve Category
        String catId = request.getCategory();
        if (catId == null && request.getCategories() != null && !request.getCategories().isEmpty()) {
            catId = request.getCategories().get(0);
        }
        
        Categorie categorie = null;
        if (catId != null) {
            categorie = categorieRepository.findById(catId).orElse(null);
        }
        
        if (categorie == null) {
            // Fallback to first category
            categorie = categorieRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Aucune catégorie trouvée. Veuillez en créer une d'abord."));
        }

        // 3. Create Product
        Produit produit = new Produit();
        produit.setBoutique(boutique);
        produit.setCategorie(categorie);
        produit.setNom(request.getName());
        produit.setReferencePartenaire(request.getReferenceProduitPartenaire());
        // Simple slug generation
        produit.setSlug(request.getName().toLowerCase().replace(" ", "-") + "-" + UUID.randomUUID().toString().substring(0, 8));
        produit.setDescription(request.getDescription());
        produit.setMarque(request.getBrand());
        produit.setPrix(request.getPrice());
        produit.setTva(request.getVat());
        
        try {
            if (request.getStatus() != null) {
                // Map frontend status (ACTIVE, DRAFT, ARCHIVED) to Enum (ACTIF, BROUILLON, ARCHIVE) if needed
                // Assuming frontend sends matching names or close enough
                String statusStr = request.getStatus();
                if ("ACTIVE".equalsIgnoreCase(statusStr)) statusStr = "ACTIF";
                if ("DRAFT".equalsIgnoreCase(statusStr)) statusStr = "BROUILLON";
                if ("ARCHIVED".equalsIgnoreCase(statusStr)) statusStr = "ARCHIVE";
                produit.setStatut(StatutProduit.valueOf(statusStr));
            }
        } catch (Exception e) {
            produit.setStatut(StatutProduit.BROUILLON);
        }

        produit = produitRepository.save(produit);

        // 4. Create Stock
        Stock stock = new Stock();
        stock.setProduit(produit);
        stock.setQuantiteDisponible(request.getStock() != null ? request.getStock() : 0);
        stock.setQuantiteReservee(0);
        stockRepository.save(stock);
        recordStockMovement(produit, TypeMouvementStock.ENTREE, stock.getQuantiteDisponible(), 0, stock.getQuantiteDisponible(), "CREATION_PRODUIT");

        // 5. Create Image
        if (request.getImg() != null && !request.getImg().isBlank()) {
            ProduitImage image = new ProduitImage();
            image.setProduit(produit);
            image.setUrl(request.getImg());
            image.setEstPrincipale(true);
            produitImageRepository.save(image);
        }

        return toSummary(produit);
    }

    @Transactional
    public ProductSummaryDto updateProduct(String id, UpdateProductRequest request) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        Integer previousStock = stockRepository.findByProduit(produit)
                .map(Stock::getQuantiteDisponible)
                .orElse(0);

        if (request.getName() != null) {
            produit.setNom(request.getName());
        }
        if (request.getDescription() != null) {
            produit.setDescription(request.getDescription());
        }
        if (request.getBrand() != null) {
            produit.setMarque(request.getBrand());
        }
        if (request.getPrice() != null) {
            produit.setPrix(request.getPrice());
        }
        if (request.getVat() != null) {
            produit.setTva(request.getVat());
        }
        if (request.getStatus() != null) {
            String statusStr = request.getStatus();
            try {
                if ("ACTIVE".equalsIgnoreCase(statusStr)) statusStr = "ACTIF";
                if ("DRAFT".equalsIgnoreCase(statusStr)) statusStr = "BROUILLON";
                if ("ARCHIVED".equalsIgnoreCase(statusStr)) statusStr = "ARCHIVE";
                produit.setStatut(StatutProduit.valueOf(statusStr));
            } catch (Exception ignored) {}
        }

        // Support both categoryId and category (alias)
        String catId = request.getCategoryId();
        if (catId == null) {
            catId = request.getCategory();
        }

        if (catId != null) {
            Categorie categorie = categorieRepository.findById(catId)
                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
            produit.setCategorie(categorie);
        }
        
        if (request.getReferencePartenaire() != null) {
            produit.setReferencePartenaire(request.getReferencePartenaire());
        }

        produit = produitRepository.save(produit);

        if (request.getStock() != null) {
            Stock stock = stockRepository.findByProduit(produit).orElse(null);
            if (stock == null) {
                stock = new Stock();
                stock.setProduit(produit);
                stock.setQuantiteReservee(0);
            }
            stock.setQuantiteDisponible(request.getStock());
            stockRepository.save(stock);
            int diff = (request.getStock() != null ? request.getStock() : 0) - (previousStock != null ? previousStock : 0);
            if (diff != 0) {
                recordStockMovement(produit, TypeMouvementStock.AJUSTEMENT, diff, previousStock, request.getStock(), "MAJ_STOCK_PRODUIT");
            }
        }

        return toSummary(produit);
    }

    private void recordStockMovement(Produit produit, TypeMouvementStock type, Integer quantite, Integer stockAvant, Integer stockApres, String reference) {
        if (produit == null || type == null || quantite == null) return;
        if (quantite == 0) return;
        if (stockAvant == null || stockApres == null) return;
        String sku = produit.getReferencePartenaire();
        if (sku == null || sku.isBlank()) {
            sku = produit.getId();
        }
        StockMouvement mouvement = new StockMouvement();
        mouvement.setProduit(produit);
        mouvement.setSku(sku);
        mouvement.setType(type);
        mouvement.setQuantite(quantite);
        mouvement.setStockAvant(stockAvant);
        mouvement.setStockApres(stockApres);
        mouvement.setReference(reference);
        stockMouvementRepository.save(mouvement);
    }

    @Transactional
    public void deleteProduct(String id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

        produit.setStatut(StatutProduit.ARCHIVE);
        produitRepository.save(produit);
    }

    @Transactional
    public BulkDeleteProductsResponse deleteProductsBulk(List<String> ids) {
        List<String> requestedRaw = ids == null ? List.of() : ids;
        List<String> requested = new ArrayList<>();
        for (String id : requestedRaw) {
            if (id == null) continue;
            String trimmed = id.trim();
            if (trimmed.isEmpty()) continue;
            requested.add(trimmed);
        }
        if (requested.isEmpty()) {
            return new BulkDeleteProductsResponse(0, 0, List.of());
        }
        List<Produit> produits = produitRepository.findAllById(requested);
        Set<String> foundIds = new HashSet<>();
        for (Produit p : produits) {
            foundIds.add(p.getId());
            p.setStatut(StatutProduit.ARCHIVE);
        }
        produitRepository.saveAll(produits);

        List<String> notFound = new ArrayList<>();
        for (String id : requested) {
            if (!foundIds.contains(id)) notFound.add(id);
        }
        return new BulkDeleteProductsResponse(requested.size(), produits.size(), notFound);
    }

    private ProductSummaryDto toSummary(Produit produit) {
        String categoryId = produit.getCategorie() != null ? produit.getCategorie().getId() : null;
        String categoryName = produit.getCategorie() != null ? produit.getCategorie().getNom() : "-";
        Stock stock = stockRepository.findByProduit(produit).orElse(null);
        Integer stockQty = stock != null ? stock.getQuantiteDisponible() : 0;

        return new ProductSummaryDto(
            produit.getId(),
            produit.getReferencePartenaire(),
            produit.getNom(),
            categoryId,
            categoryName,
            produit.getPrix(),
            stockQty,
            produit.getStatut() != null ? produit.getStatut().name() : "-"
        );
    }
}
