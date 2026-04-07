package com.lifeevent.lid.article.repository;

import com.lifeevent.lid.article.entity.Category;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    
    /**
     * Recherche par nom
     */
    Optional<Category> findByNameIgnoreCase(String name);
    Optional<Category> findBySlugIgnoreCase(String slug);


    /**
     * Lister toutes les catégories ordonnées
     */
    List<Category> findAllByOrderByOrderIdxAsc();

    @Modifying
    @Query("""
        UPDATE Category c
        SET c.isActivated = false
        WHERE c.id IN :ids
    """)
    int deactivateAllByIds(@Param("ids") List<Integer> ids);

    @Modifying
    @Query("""
        UPDATE Category c
        SET c.isActivated = false
        WHERE c.isActivated = true
    """)
    int deactivateAllActivated();
}
