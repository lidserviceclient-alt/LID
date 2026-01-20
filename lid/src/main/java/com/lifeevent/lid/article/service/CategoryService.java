package com.lifeevent.lid.article.service;

import com.lifeevent.lid.article.dto.CategoryDto;

import java.util.List;
import java.util.Optional;

public interface CategoryService {
    
    /**
     * Créer une catégorie
     */
    CategoryDto createCategory(CategoryDto dto);
    
    /**
     * Récupérer une catégorie par ID
     */
    Optional<CategoryDto> getCategoryById(Integer id);
    
    /**
     * Lister toutes les catégories
     */
    List<CategoryDto> getAllCategories();
    
    /**
     * Recherche par nom
     */
    Optional<CategoryDto> getCategoryByName(String name);
    
    /**
     * Mettre à jour une catégorie
     */
    CategoryDto updateCategory(Integer id, CategoryDto dto);
    
    /**
     * Supprimer une catégorie
     */
    void deleteCategory(Integer id);
}
