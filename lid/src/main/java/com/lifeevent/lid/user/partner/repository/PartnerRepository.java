package com.lifeevent.lid.user.partner.repository;

import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'entité Partner
 * Ne redéclare que les requêtes spécifiques Partner
 * Les requêtes génériques (par userId, email, etc) viennent via UserRepository
 */
@Repository
public interface PartnerRepository extends JpaRepository<Partner, String> {

    @Override
    @EntityGraph(attributePaths = {"user", "shop"})
    Optional<Partner> findById(String userId);

    @Override
    @EntityGraph(attributePaths = {"user", "shop"})
    java.util.List<Partner> findAllById(Iterable<String> userIds);

    /**
     * Récupérer un Partner par email
     * Charge le Partner avec sa Shop si elle existe
     */
    @EntityGraph(attributePaths = {"user", "shop"})
    @Query("SELECT p FROM Partner p LEFT JOIN FETCH p.shop WHERE p.user.email = :email")
    Optional<Partner> findByEmailWithShop(@Param("email") String email);
    
    /**
     * Vérifier si un email existe parmi les Partners
     */
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Partner p WHERE p.user.email = :email")
    boolean existsByEmail(@Param("email") String email);
    
    /**
     * Récupérer un Partner par userId avec sa Shop (ÉTAPE 2, 3)
     */
    @EntityGraph(attributePaths = {"shop"})
    @Query("SELECT p FROM Partner p WHERE p.userId = :userId")
    Optional<Partner> findByUserIdWithShop(@Param("userId") String userId);

    @EntityGraph(attributePaths = {"user", "shop", "shop.mainCategory"})
    @Query("""
        SELECT p
        FROM Partner p
        LEFT JOIN p.shop s
        WHERE p.registrationStatus = :status
          AND (
            :queryEmpty = true OR
            LOWER(COALESCE(p.user.firstName, '')) LIKE :queryPattern OR
            LOWER(COALESCE(p.user.lastName, '')) LIKE :queryPattern OR
            LOWER(COALESCE(p.user.email, '')) LIKE :queryPattern OR
            LOWER(COALESCE(s.shopName, '')) LIKE :queryPattern
          )
        ORDER BY p.createdAt DESC
    """)
    Page<Partner> searchVerifiedForCatalog(
            @Param("status") PartnerRegistrationStatus status,
            @Param("queryPattern") String queryPattern,
            @Param("queryEmpty") boolean queryEmpty,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"user", "shop", "shop.mainCategory"})
    @Query("SELECT p FROM Partner p WHERE p.userId = :userId AND p.registrationStatus = :status")
    Optional<Partner> findVerifiedByUserIdWithShop(@Param("userId") String userId, @Param("status") PartnerRegistrationStatus status);

    @EntityGraph(attributePaths = {"user", "shop", "shop.mainCategory"})
    @Query("""
        SELECT p
        FROM Partner p
        LEFT JOIN p.shop s
        WHERE (:statusEmpty = true OR p.registrationStatus IN :statuses)
          AND (
            :queryEmpty = true OR
            LOWER(COALESCE(p.user.firstName, '')) LIKE :queryPattern OR
            LOWER(COALESCE(p.user.lastName, '')) LIKE :queryPattern OR
            LOWER(COALESCE(p.user.email, '')) LIKE :queryPattern OR
            LOWER(COALESCE(s.shopName, '')) LIKE :queryPattern
          )
        ORDER BY p.createdAt DESC
    """)
    Page<Partner> searchBackofficePartners(
            @Param("statuses") List<PartnerRegistrationStatus> statuses,
            @Param("statusEmpty") boolean statusEmpty,
            @Param("queryPattern") String queryPattern,
            @Param("queryEmpty") boolean queryEmpty,
            Pageable pageable
    );
}
