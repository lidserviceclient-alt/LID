package com.lifeevent.lid.core.service;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.core.dto.BulkDeleteProductsResponse;
import com.lifeevent.lid.core.dto.CatalogProductDto;
import com.lifeevent.lid.core.dto.CatalogProductDetailsDto;
import com.lifeevent.lid.core.dto.CreateProductRequest;
import com.lifeevent.lid.core.dto.ProductSummaryDto;
import com.lifeevent.lid.core.dto.UpdateProductRequest;
import com.lifeevent.lid.core.entity.*;
import com.lifeevent.lid.core.enums.StatutProduit;
import com.lifeevent.lid.core.enums.TypeMouvementStock;
import com.lifeevent.lid.core.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
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
    private final EanService eanService;

    public ProductService(ProduitRepository produitRepository, 
                          StockRepository stockRepository,
                          BoutiqueRepository boutiqueRepository,
                          CategorieRepository categorieRepository,
                          ProduitImageRepository produitImageRepository,
                          StockMouvementRepository stockMouvementRepository,
                          EanService eanService) {
        this.produitRepository = produitRepository;
        this.stockRepository = stockRepository;
        this.boutiqueRepository = boutiqueRepository;
        this.categorieRepository = categorieRepository;
        this.produitImageRepository = produitImageRepository;
        this.stockMouvementRepository = stockMouvementRepository;
        this.eanService = eanService;
    }

    public Page<ProductSummaryDto> listProducts(Pageable pageable) {
        return produitRepository.findAll(pageable).map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public Page<CatalogProductDto> listCatalogProducts(Pageable pageable) {
        return produitRepository.findByStatutNot(StatutProduit.ARCHIVE, pageable).map(this::toCatalogDto);
    }

    @Transactional(readOnly = true)
    public Page<CatalogProductDto> searchCatalogProducts(Pageable pageable, String q, List<String> categoryTokens) {
        String query = q == null ? null : q.trim();
        if (query != null && query.isBlank()) query = null;

        List<String> cats = null;
        if (categoryTokens != null && !categoryTokens.isEmpty()) {
            cats = categoryTokens.stream()
                    .map((v) -> v == null ? "" : v.trim())
                    .filter((v) -> !v.isBlank())
                    .map((v) -> v.toLowerCase(Locale.ROOT))
                    .toList();
            if (cats.isEmpty()) cats = null;
        }

        if (query == null && cats == null) {
            return listCatalogProducts(pageable);
        }

        return produitRepository.searchCatalog(StatutProduit.ARCHIVE, query, cats, pageable).map(this::toCatalogDto);
    }

    @Transactional(readOnly = true)
    public List<CatalogProductDto> listFeaturedCatalogProducts(Integer limit) {
        int safeLimit = limit == null ? 12 : Math.max(1, Math.min(limit, 50));
        Pageable pageable = PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "dateCreation"));
        return produitRepository.findByIsFeaturedTrueAndStatutNot(StatutProduit.ARCHIVE, pageable)
                .map(this::toCatalogDto)
                .getContent();
    }

    @Transactional(readOnly = true)
    public List<CatalogProductDto> listBestSellerCatalogProducts(Integer limit) {
        int safeLimit = limit == null ? 12 : Math.max(1, Math.min(limit, 50));
        Pageable pageable = PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "dateCreation"));
        return produitRepository.findByIsBestSellerTrueAndStatutNot(StatutProduit.ARCHIVE, pageable)
                .map(this::toCatalogDto)
                .getContent();
    }

    @Transactional(readOnly = true)
    public List<CatalogProductDto> listLatestCatalogProducts(Integer limit) {
        int safeLimit = limit == null ? 20 : Math.max(1, Math.min(limit, 50));
        Pageable pageable = PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "dateCreation"));
        return produitRepository.findByStatutNot(StatutProduit.ARCHIVE, pageable)
                .map(this::toCatalogDto)
                .getContent();
    }

    @Transactional(readOnly = true)
    public CatalogProductDto getCatalogProduct(String id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit", "id", id));
        if (produit.getStatut() == StatutProduit.ARCHIVE) {
            throw new ResourceNotFoundException("Produit", "id", id);
        }
        return toCatalogDto(produit);
    }

    @Transactional(readOnly = true)
    public CatalogProductDetailsDto getCatalogProductDetails(String id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit", "id", id));
        if (produit.getStatut() == StatutProduit.ARCHIVE) {
            throw new ResourceNotFoundException("Produit", "id", id);
        }

        Categorie categorie = produit.getCategorie();
        String categoryId = categorie != null ? categorie.getId() : null;
        String categoryName = categorie != null ? categorie.getNom() : null;
        String categorySlug = categorie != null ? categorie.getSlug() : null;

        Integer stockQty = stockRepository.findByProduit(produit)
                .map(Stock::getQuantiteDisponible)
                .orElse(0);

        List<String> imageUrls = resolveImageUrls(produit);
        String mainImage = imageUrls.isEmpty() ? null : imageUrls.get(0);

        BigDecimal price = produit.getPrix() != null ? produit.getPrix() : BigDecimal.ZERO;

        return new CatalogProductDetailsDto(
                produit.getId(),
                produit.getReferencePartenaire(),
                produit.getNom(),
                produit.getSlug(),
                price,
                produit.getMarque(),
                produit.getDescription(),
                produit.getTva(),
                categoryId,
                categoryName,
                categorySlug,
                produit.getIsFeatured(),
                produit.getIsBestSeller(),
                mainImage,
                imageUrls,
                stockQty,
                produit.getDateCreation()
        );
    }

    @Transactional(readOnly = true)
    public ProductSummaryDto getProduct(String id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produit", "id", id));
        return toSummary(produit);
    }

    @Transactional
    public ProductSummaryDto createProduct(CreateProductRequest request) {
        // 1. Resolve Boutique (default to first found if not specified)
        Boutique boutique = boutiqueRepository.findAll().stream().findFirst()
            .orElseThrow(() -> new RuntimeException("Aucune boutique trouvée. Veuillez en créer une d'abord."));

        String catIdOrSlug = request.getCategory();
        if ((catIdOrSlug == null || catIdOrSlug.isBlank()) && request.getCategories() != null && !request.getCategories().isEmpty()) {
            for (String value : request.getCategories()) {
                if (value != null && !value.isBlank()) {
                    catIdOrSlug = value;
                    break;
                }
            }
        }

        Categorie categorie;
        if (catIdOrSlug != null && !catIdOrSlug.isBlank()) {
            String categoryKey = catIdOrSlug;
            categorie = resolveCategorie(categoryKey)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", "idOrSlug", categoryKey));
        } else {
            categorie = categorieRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Aucune catégorie trouvée. Veuillez en créer une d'abord."));
        }

        // 3. Create Product
        String sku = request.getSku() != null && !request.getSku().isBlank()
                ? request.getSku().trim()
                : request.getReferenceProduitPartenaire().trim();
        if (sku.isBlank()) {
            throw new IllegalArgumentException("SKU requis.");
        }
        if (produitRepository.findByReferencePartenaireIgnoreCase(sku).isPresent()) {
            throw new IllegalArgumentException("SKU déjà utilisé.");
        }
        String ean = eanService.ensureValidOrGenerate(sku, request.getEan());

        Produit produit = new Produit();
        produit.setBoutique(boutique);
        produit.setCategorie(categorie);
        produit.setNom(request.getName());
        produit.setReferencePartenaire(sku);
        produit.setEan(ean);
        // Simple slug generation
        produit.setSlug(request.getName().toLowerCase().replace(" ", "-") + "-" + UUID.randomUUID().toString().substring(0, 8));
        produit.setDescription(request.getDescription());
        produit.setMarque(request.getBrand());
        produit.setPrix(request.getPrice());
        produit.setTva(request.getVat());
        produit.setIsFeatured(Boolean.TRUE.equals(request.getIsFeatured()));
        produit.setIsBestSeller(Boolean.TRUE.equals(request.getIsBestSeller()));
        
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
                .orElseThrow(() -> new ResourceNotFoundException("Produit", "id", id));
        Integer previousStock = stockRepository.findByProduit(produit)
                .map(Stock::getQuantiteDisponible)
                .orElse(0);

        if (request.getReferencePartenaire() != null && !request.getReferencePartenaire().isBlank()) {
            String currentSku = produit.getReferencePartenaire() == null ? "" : produit.getReferencePartenaire().trim();
            String nextSku = request.getReferencePartenaire().trim();
            if (!nextSku.equalsIgnoreCase(currentSku)) {
                throw new IllegalArgumentException("Le SKU ne peut pas être modifié.");
            }
        }

        if (request.getName() != null) {
            produit.setNom(request.getName());
        }
        if (request.getEan() != null) {
            String next = request.getEan().trim();
            if (next.isEmpty()) {
                produit.setEan(eanService.regenerate(produit.getReferencePartenaire()));
            } else {
                String current = produit.getEan() == null ? "" : produit.getEan().trim();
                if (!next.equals(current)) {
                    produit.setEan(eanService.ensureValidOrGenerate(produit.getReferencePartenaire(), next));
                }
            }
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

        if (request.getIsFeatured() != null) {
            produit.setIsFeatured(request.getIsFeatured());
        }
        if (request.getIsBestSeller() != null) {
            produit.setIsBestSeller(request.getIsBestSeller());
        }

        String catIdOrSlug = request.getCategoryId();
        if (catIdOrSlug == null || catIdOrSlug.isBlank()) {
            catIdOrSlug = request.getCategory();
        }

        if (catIdOrSlug != null && !catIdOrSlug.isBlank()) {
            String categoryKey = catIdOrSlug;
            Categorie categorie = resolveCategorie(categoryKey)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", "idOrSlug", categoryKey));
            produit.setCategorie(categorie);
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
                .orElseThrow(() -> new ResourceNotFoundException("Produit", "id", id));

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

        if (produit.getEan() == null || produit.getEan().trim().isEmpty()) {
            produit.setEan(eanService.regenerate(produit.getReferencePartenaire()));
            produitRepository.save(produit);
        }

        return new ProductSummaryDto(
            produit.getId(),
            produit.getReferencePartenaire(),
            produit.getEan(),
            produit.getNom(),
            categoryId,
            categoryName,
            produit.getPrix(),
            stockQty,
            produit.getStatut() != null ? produit.getStatut().name() : "-",
            produit.getIsFeatured(),
            produit.getIsBestSeller()
        );
    }

    private CatalogProductDto toCatalogDto(Produit produit) {
        Categorie categorie = produit.getCategorie();
        String categoryId = categorie != null ? categorie.getId() : null;
        String categoryName = categorie != null ? categorie.getNom() : null;
        String categorySlug = categorie != null ? categorie.getSlug() : null;

        Integer stockQty = stockRepository.findByProduit(produit)
                .map(Stock::getQuantiteDisponible)
                .orElse(0);

        String imageUrl = null;
        List<ProduitImage> images = produit.getImages();
        if (images != null && !images.isEmpty()) {
            ProduitImage principal = null;
            for (ProduitImage img : images) {
                if (img != null && Boolean.TRUE.equals(img.getEstPrincipale())) {
                    principal = img;
                    break;
                }
            }
            ProduitImage chosen = principal != null ? principal : images.get(0);
            imageUrl = chosen != null ? chosen.getUrl() : null;
        }

        BigDecimal price = produit.getPrix() != null ? produit.getPrix() : BigDecimal.ZERO;

        return new CatalogProductDto(
                produit.getId(),
                produit.getReferencePartenaire(),
                produit.getNom(),
                produit.getSlug(),
                price,
                produit.getMarque(),
                categoryId,
                categoryName,
                categorySlug,
                produit.getIsFeatured(),
                produit.getIsBestSeller(),
                imageUrl,
                stockQty,
                produit.getDateCreation()
        );
    }

    private static List<String> resolveImageUrls(Produit produit) {
        List<ProduitImage> images = produit != null ? produit.getImages() : null;
        if (images == null || images.isEmpty()) return List.of();

        ProduitImage principal = null;
        for (ProduitImage img : images) {
            if (img != null && Boolean.TRUE.equals(img.getEstPrincipale())) {
                principal = img;
                break;
            }
        }

        java.util.LinkedHashSet<String> urls = new java.util.LinkedHashSet<>();
        if (principal != null && principal.getUrl() != null && !principal.getUrl().isBlank()) {
            urls.add(principal.getUrl());
        }
        for (ProduitImage img : images) {
            if (img == null) continue;
            String url = img.getUrl();
            if (url == null) continue;
            String trimmed = url.trim();
            if (trimmed.isEmpty()) continue;
            urls.add(trimmed);
        }

        return new java.util.ArrayList<>(urls);
    }

    private java.util.Optional<Categorie> resolveCategorie(String idOrSlug) {
        if (idOrSlug == null) return java.util.Optional.empty();
        String trimmed = idOrSlug.trim();
        if (trimmed.isEmpty()) return java.util.Optional.empty();
        return categorieRepository.findById(trimmed)
            .or(() -> categorieRepository.findBySlug(trimmed.toLowerCase()));
    }
}
