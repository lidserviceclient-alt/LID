package com.lifeevent.lid.user.partner.repository;

import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository pour l'entité Partner
 * Ne redéclare que les requêtes spécifiques Partner
 * Les requêtes génériques (par userId, email, etc) viennent via UserRepository
 */
@Repository
public interface PartnerRepository extends JpaRepository<Partner, String> {

    @Modifying
    @Query(value = "UPDATE user_entity SET user_type = 'PARTNER' WHERE user_id = :userId", nativeQuery = true)
    void updateUserTypeToPartner(@Param("userId") String userId);

    @Modifying
    @Query(value = "DELETE FROM customer WHERE user_id = :userId", nativeQuery = true)
    void deleteCustomerData(@Param("userId") String userId);

    @Modifying
    @Query(value = "INSERT INTO partner (user_id, registration_status, phone_number) VALUES (:userId, 'STEP_1_PENDING', :phone)", nativeQuery = true)
    void insertInitialPartnerData(@Param("userId") String userId, @Param("phone") String phone);
    
    /**
     * Récupérer un Partner par email
     * Charge le Partner avec sa Shop si elle existe
     */
    @Query("SELECT p FROM Partner p LEFT JOIN FETCH p.shop WHERE p.email = :email")
    Optional<Partner> findByEmailWithShop(@Param("email") String email);
    
    /**
     * Vérifier si un email existe parmi les Partners
     */
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Partner p WHERE p.email = :email")
    boolean existsByEmail(@Param("email") String email);
    
    /**
     * Récupérer un Partner par userId avec sa Shop (ÉTAPE 2, 3)
     */
    @EntityGraph(attributePaths = {"shop"})
    @Query("SELECT p FROM Partner p WHERE p.userId = :userId")
    Optional<Partner> findByUserIdWithShop(@Param("userId") String userId);

    @EntityGraph(attributePaths = {"shop", "shop.mainCategory"})
    @Query("""
        SELECT p
        FROM Partner p
        LEFT JOIN p.shop s
        WHERE p.registrationStatus = :status
          AND (
            :queryEmpty = true OR
            LOWER(COALESCE(p.firstName, '')) LIKE :queryPattern OR
            LOWER(COALESCE(p.lastName, '')) LIKE :queryPattern OR
            LOWER(COALESCE(p.email, '')) LIKE :queryPattern OR
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

    @EntityGraph(attributePaths = {"shop", "shop.mainCategory"})
    @Query("SELECT p FROM Partner p WHERE p.userId = :userId AND p.registrationStatus = :status")
    Optional<Partner> findVerifiedByUserIdWithShop(@Param("userId") String userId, @Param("status") PartnerRegistrationStatus status);
}
