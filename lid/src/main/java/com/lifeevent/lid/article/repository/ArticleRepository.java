package com.lifeevent.lid.article.repository;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    
    /**
     * Trouver par referenceProduitPartenaire (clé métier)
     */
    Optional<Article> findByReferenceProduitPartenaire(String referenceProduitPartenaire);

    /**
     * Trouver par EAN
     */
    Optional<Article> findByEan(String ean);
    
    /**
     * Recherche par statut avec pagination
     */
    Page<Article> findByStatus(ArticleStatus status, Pageable pageable);
    
    /**
     * Recherche par nom - ACTIVE uniquement
     */
    Page<Article> findByNameContainingIgnoreCaseAndStatus(String name, ArticleStatus status, Pageable pageable);
    
    /**
     * Recherche par catégorie - ACTIVE uniquement
     */
    @Query("SELECT DISTINCT a FROM Article a JOIN a.categories c WHERE c.id = :categoryId AND a.status = :status")
    Page<Article> findByCategoryAndStatus(@Param("categoryId") Integer categoryId, @Param("status") ArticleStatus status, Pageable pageable);
    
    /**
     * Articles featured (lid choice)
     */
    @Query("SELECT a FROM Article a WHERE a.isFeatured = true AND a.status = 'ACTIVE' ORDER BY a.updatedAt DESC")
    List<Article> findFeaturedArticles();

    /**
     * Meilleures ventes
     */
    @Query("SELECT a FROM Article a WHERE a.isBestSeller = true AND a.status = 'ACTIVE' ORDER BY a.updatedAt DESC")
    List<Article> findBestSellers();

    /**
     * Ventes flash
     */
    @Query("SELECT a FROM Article a WHERE a.isFlashSale = true AND a.flashSaleEndsAt > :now AND a.status = 'ACTIVE' ORDER BY a.flashSaleEndsAt ASC")
    List<Article> findFlashSales(@Param("now") LocalDateTime now);

    /**
     * Nouveautés (récemment créés)
     */
    @Query("SELECT a FROM Article a WHERE a.status = 'ACTIVE' ORDER BY a.createdAt DESC")
    Page<Article> findNewArticles(Pageable pageable);

    /**
     * Recherche par plage de prix
     */
    @Query("SELECT a FROM Article a WHERE a.price BETWEEN :minPrice AND :maxPrice AND a.status = :status ORDER BY a.price ASC")
    Page<Article> findByPriceRangeAndStatus(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice, @Param("status") ArticleStatus status, Pageable pageable);
    
    /**
     * Recherche combinée : nom + catégorie
     */
    @Query("SELECT DISTINCT a FROM Article a JOIN a.categories c " +
           "WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%')) " +
           "AND c.id = :categoryId AND a.status = :status")
    Page<Article> findByNameAndCategoryAndStatus(@Param("name") String name, @Param("categoryId") Integer categoryId, @Param("status") ArticleStatus status, Pageable pageable);
    
    /**
     * Recherche combinée : nom + plage de prix
     */
    @Query("SELECT a FROM Article a " +
           "WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%')) " +
           "AND a.price BETWEEN :minPrice AND :maxPrice " +
           "AND a.status = :status " +
           "ORDER BY a.price ASC")
    Page<Article> findByNameAndPriceRangeAndStatus(@Param("name") String name, 
                                          @Param("minPrice") Double minPrice, 
                                          @Param("maxPrice") Double maxPrice,
                                          @Param("status") ArticleStatus status,
                                          Pageable pageable);

    /**
     * Recherche complète avec pagination et filtres (ACTIVE uniquement)
     */
    @Query("""
        SELECT DISTINCT a
        FROM Article a
        LEFT JOIN a.categories c
        WHERE a.status = :status
          AND (:name IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%')))
          AND (:categoryId IS NULL OR c.id = :categoryId)
          AND (:minPrice IS NULL OR a.price >= :minPrice)
          AND (:maxPrice IS NULL OR a.price <= :maxPrice)
        ORDER BY a.updatedAt DESC
    """)
    Page<Article> findByAdvancedSearchAndStatus(
            @Param("name") String name,
            @Param("categoryId") Integer categoryId,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("status") ArticleStatus status,
            Pageable pageable
    );
    
    /**
     * Récupérer tous les articles d'un partenaire avec pagination
     */
    Page<Article> findByReferencePartner(String partnerId, Pageable pageable);

}
