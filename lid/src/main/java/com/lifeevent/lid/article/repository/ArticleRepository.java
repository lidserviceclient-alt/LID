package com.lifeevent.lid.article.repository;

import com.lifeevent.lid.article.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    
    /**
     * Recherche par nom/titre
     */
    List<Article> findByNameContainingIgnoreCase(String name);
    
    /**
     * Recherche par catégorie
     */
    @Query("SELECT DISTINCT a FROM Article a JOIN a.categories c WHERE c.id = :categoryId")
    List<Article> findByCategory(@Param("categoryId") Integer categoryId);
    
    /**
     * Recherche par plage de prix
     */
    @Query("SELECT a FROM Article a WHERE a.price BETWEEN :minPrice AND :maxPrice ORDER BY a.price ASC")
    List<Article> findByPriceRange(@Param("minPrice") Integer minPrice, @Param("maxPrice") Integer maxPrice);
    
    /**
     * Recherche combinée : nom + catégorie
     */
    @Query("SELECT DISTINCT a FROM Article a JOIN a.categories c " +
           "WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%')) " +
           "AND c.id = :categoryId")
    List<Article> findByNameAndCategory(@Param("name") String name, @Param("categoryId") Integer categoryId);
    
    /**
     * Recherche combinée : nom + plage de prix
     */
    @Query("SELECT a FROM Article a " +
           "WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%')) " +
           "AND a.price BETWEEN :minPrice AND :maxPrice " +
           "ORDER BY a.price ASC")
    List<Article> findByNameAndPriceRange(@Param("name") String name, 
                                          @Param("minPrice") Integer minPrice, 
                                          @Param("maxPrice") Integer maxPrice);

    /**
     * Recherche complète : nom + catégorie + plage de prix
     */
    @Query("""
        SELECT DISTINCT a
              FROM Article a
              JOIN a.categories c
        WHERE (:name IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%')))
              AND (:categoryId IS NULL OR c.id = :categoryId)
              AND (:minPrice IS NULL OR a.price >= :minPrice)
              AND (:maxPrice IS NULL OR a.price <= :maxPrice)
        ORDER BY a.price ASC
    """)
    List<Article> searchArticles(
            @Param("name") String name,
            @Param("categoryId") Integer categoryId,
            @Param("minPrice") Integer minPrice,
            @Param("maxPrice") Integer maxPrice
    );

}
