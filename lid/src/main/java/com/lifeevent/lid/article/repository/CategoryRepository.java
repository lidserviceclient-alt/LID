package com.lifeevent.lid.article.repository;

import com.lifeevent.lid.article.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    
    /**
     * Recherche par nom
     */
    Optional<Category> findByNameIgnoreCase(String name);


    /**
     * Lister toutes les catégories ordonnées
     */
    List<Category> findAllByOrderByOrderIdxAsc();
}
