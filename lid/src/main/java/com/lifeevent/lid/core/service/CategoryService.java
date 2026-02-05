package com.lifeevent.lid.core.service;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.core.dto.BulkDeleteCategoriesResponse;
import com.lifeevent.lid.core.dto.CategoryDto;
import com.lifeevent.lid.core.dto.PurgeCatalogResponse;
import com.lifeevent.lid.core.dto.UpsertCategoryRequest;
import com.lifeevent.lid.core.entity.Categorie;
import com.lifeevent.lid.core.enums.NiveauCategorie;
import com.lifeevent.lid.core.repository.CategorieRepository;
import com.lifeevent.lid.core.repository.ProduitRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
public class CategoryService {

    private final CategorieRepository categorieRepository;
    private final ProduitRepository produitRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public CategoryService(CategorieRepository categorieRepository, ProduitRepository produitRepository) {
        this.categorieRepository = categorieRepository;
        this.produitRepository = produitRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> listAll() {
        Sort sort = Sort.by("ordre").ascending().and(Sort.by("nom").ascending());
        return categorieRepository.findAll(sort).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public CategoryDto getById(String id) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", "id", id));
        return toDto(categorie);
    }

    @Transactional
    public CategoryDto create(UpsertCategoryRequest request) {
        Categorie categorie = new Categorie();
        applyRequest(categorie, request);
        categorie = categorieRepository.save(categorie);
        return toDto(categorie);
    }

    @Transactional
    public CategoryDto update(String id, UpsertCategoryRequest request) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", "id", id));
        applyRequest(categorie, request);
        categorie = categorieRepository.save(categorie);
        return toDto(categorie);
    }

    @Transactional
    public void delete(String id) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categorie", "id", id));
        categorie.setEstActive(Boolean.FALSE);
        categorieRepository.save(categorie);
    }

    @Transactional
    public BulkDeleteCategoriesResponse deactivateBulk(List<String> ids) {
        List<String> requestedRaw = ids == null ? List.of() : ids;
        List<String> requested = new ArrayList<>();
        for (String id : requestedRaw) {
            if (id == null) continue;
            String trimmed = id.trim();
            if (trimmed.isEmpty()) continue;
            requested.add(trimmed);
        }
        if (requested.isEmpty()) {
            return new BulkDeleteCategoriesResponse(0, 0, List.of());
        }
        List<Categorie> categories = categorieRepository.findAllById(requested);
        Set<String> foundIds = new HashSet<>();
        for (Categorie c : categories) {
            foundIds.add(c.getId());
            c.setEstActive(Boolean.FALSE);
        }
        categorieRepository.saveAll(categories);

        List<String> notFound = new ArrayList<>();
        for (String id : requested) {
            if (!foundIds.contains(id)) notFound.add(id);
        }
        return new BulkDeleteCategoriesResponse(requested.size(), categories.size(), notFound);
    }

    @Transactional
    public PurgeCatalogResponse purgeAll(boolean withProducts) {
        long categoriesCount = categorieRepository.count();
        long productsCount = produitRepository.count();

        if (!withProducts && productsCount > 0) {
            throw new IllegalArgumentException(
                    "Impossible de supprimer définitivement les catégories : " + productsCount + " produit(s) existent. Supprimez les produits d'abord."
            );
        }

        int updatedOrderLines = 0;
        int deletedCartLines = 0;
        int deletedProducts = 0;

        if (withProducts && productsCount > 0) {
            updatedOrderLines = entityManager
                    .createNativeQuery("UPDATE commande_ligne SET produit_id = NULL WHERE produit_id IS NOT NULL")
                    .executeUpdate();

            deletedCartLines = entityManager
                    .createNativeQuery("DELETE FROM panier_ligne")
                    .executeUpdate();

            safeExecute("DELETE FROM stock_mouvement");
            safeExecute("DELETE FROM commentaire_produit");
            safeExecute("DELETE FROM produit_image");
            safeExecute("DELETE FROM stock");
            deletedProducts = entityManager.createNativeQuery("DELETE FROM produit").executeUpdate();
        }

        if (categoriesCount > 0) {
            categorieRepository.deleteAllInBatch();
        }

        long deletedCategories = categoriesCount;
        return new PurgeCatalogResponse(deletedCategories, deletedProducts, updatedOrderLines, deletedCartLines);
    }

    private int safeExecute(String sql) {
        try {
            return entityManager.createNativeQuery(sql).executeUpdate();
        } catch (Exception ex) {
            String msg = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase(Locale.ROOT);
            if (msg.contains("doesn't exist") || msg.contains("does not exist") || msg.contains("unknown table")) {
                return 0;
            }
            throw ex;
        }
    }

    private void applyRequest(Categorie categorie, UpsertCategoryRequest request) {
        String nom = request.getNom() != null ? request.getNom().trim() : "";
        if (nom.isBlank()) {
            throw new IllegalArgumentException("Le nom est obligatoire");
        }

        String requestedSlug = request.getSlug() != null ? request.getSlug().trim() : "";
        String baseSlug = requestedSlug.isBlank() ? slugify(nom) : slugify(requestedSlug);
        if (baseSlug.isBlank()) {
            throw new IllegalArgumentException("Le slug est invalide");
        }

        String uniqueSlug = ensureUniqueSlug(baseSlug, categorie.getId());

        Categorie parent = null;
        String parentId = request.getParentId() != null ? request.getParentId().trim() : "";
        if (!parentId.isBlank()) {
            parent = categorieRepository.findById(parentId)
                    .or(() -> categorieRepository.findBySlug(parentId))
                    .orElseThrow(() -> new ResourceNotFoundException("Categorie", "parentId", parentId));
            assertNoCycle(categorie, parent);
        }

        NiveauCategorie niveau = request.getNiveau();
        if (parent == null && niveau != NiveauCategorie.PRINCIPALE) {
            throw new IllegalArgumentException("Une catégorie sans parent doit avoir le niveau PRINCIPALE.");
        }
        if (parent != null && niveau == NiveauCategorie.PRINCIPALE) {
            throw new IllegalArgumentException("Une catégorie avec parent ne peut pas avoir le niveau PRINCIPALE.");
        }

        categorie.setNom(nom);
        categorie.setSlug(uniqueSlug);
        categorie.setImageUrl(request.getImageUrl());
        categorie.setNiveau(niveau);
        categorie.setOrdre(request.getOrdre() != null ? request.getOrdre() : 0);
        categorie.setEstActive(request.getEstActive() != null ? request.getEstActive() : Boolean.TRUE);
        categorie.setParent(parent);
    }

    private CategoryDto toDto(Categorie categorie) {
        Categorie parent = categorie.getParent();
        return new CategoryDto(
                categorie.getId(),
                parent != null ? parent.getId() : null,
                parent != null ? parent.getNom() : null,
                categorie.getNom(),
                categorie.getSlug(),
                categorie.getImageUrl(),
                categorie.getNiveau(),
                categorie.getOrdre(),
                categorie.getEstActive(),
                categorie.getDateCreation(),
                categorie.getDateMiseAJour()
        );
    }

    private String ensureUniqueSlug(String baseSlug, String excludeId) {
        String candidate = baseSlug;
        int suffix = 2;

        while (true) {
            Optional<Categorie> existing = categorieRepository.findBySlug(candidate);
            if (existing.isEmpty()) {
                return candidate;
            }
            String existingId = existing.get().getId();
            if (excludeId != null && excludeId.equals(existingId)) {
                return candidate;
            }
            candidate = baseSlug + "-" + suffix;
            suffix++;
        }
    }

    private static String slugify(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        String slug = normalized.toLowerCase(Locale.ROOT).trim();
        slug = slug.replaceAll("[^a-z0-9]+", "-");
        slug = slug.replaceAll("(^-+|-+$)", "");
        slug = slug.replaceAll("-{2,}", "-");
        return slug;
    }

    private static void assertNoCycle(Categorie categorie, Categorie parent) {
        if (categorie.getId() != null && categorie.getId().equals(parent.getId())) {
            throw new IllegalArgumentException("La catégorie ne peut pas être son propre parent.");
        }

        Categorie cursor = parent;
        int guard = 0;
        while (cursor != null && guard++ < 128) {
            if (categorie.getId() != null && categorie.getId().equals(cursor.getId())) {
                throw new IllegalArgumentException("Boucle détectée dans la hiérarchie des catégories.");
            }
            cursor = cursor.getParent();
        }
    }
}
