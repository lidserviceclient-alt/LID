package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.CommentaireProduit;
import com.lifeevent.lid.core.entity.Produit;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

public interface CommentaireProduitRepository extends JpaRepository<CommentaireProduit, String> {
    interface ProductReviewStats {
        String getProductId();
        Double getAvgRating();
        Long getReviewCount();
    }
    List<CommentaireProduit> findByProduit(Produit produit);

    Page<CommentaireProduit> findByProduitIdAndEstValideTrueAndDeletedAtIsNullOrderByDateCreationDesc(String produitId, Pageable pageable);

    Optional<CommentaireProduit> findByProduitIdAndUtilisateurId(String produitId, String utilisateurId);

    @Query("select coalesce(avg(c.note), 0) from CommentaireProduit c where c.produit.id = :pid and c.estValide = true and c.deletedAt is null")
    double avgRating(@Param("pid") String productId);

    @Query("select count(c) from CommentaireProduit c where c.produit.id = :pid and c.estValide = true and c.deletedAt is null")
    long countValid(@Param("pid") String productId);

    @Query("""
            select c.produit.id as productId,
                   coalesce(avg(c.note), 0) as avgRating,
                   count(c) as reviewCount
            from CommentaireProduit c
            where c.estValide = true
              and c.deletedAt is null
              and c.produit.id in :ids
            group by c.produit.id
            """)
    List<ProductReviewStats> findReviewStatsByProductIds(@Param("ids") Collection<String> productIds);

    @EntityGraph(attributePaths = {"produit", "utilisateur"})
    @Query("""
            select c
            from CommentaireProduit c
            join c.produit p
            join c.utilisateur u
            where (:includeDeleted = true or c.deletedAt is null)
              and (:deletedOnly = false or c.deletedAt is not null)
              and (:productId is null or p.id = :productId)
              and (:userId is null or u.id = :userId)
              and (:validated is null or c.estValide = :validated)
              and (:reported = false or coalesce(c.reportCount, 0) > 0)
              and (:q is null
                   or lower(c.commentaire) like lower(concat('%', :q, '%'))
                   or lower(p.nom) like lower(concat('%', :q, '%'))
                   or lower(coalesce(u.email, '')) like lower(concat('%', :q, '%')))
            """)
    Page<CommentaireProduit> searchBackoffice(
            Pageable pageable,
            @Param("q") String q,
            @Param("productId") String productId,
            @Param("userId") String userId,
            @Param("validated") Boolean validated,
            @Param("reported") boolean reported,
            @Param("includeDeleted") boolean includeDeleted,
            @Param("deletedOnly") boolean deletedOnly
    );
}
