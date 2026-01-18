package com.lifeevent.lid.user.partner.repository;

import com.lifeevent.lid.user.partner.entity.Partner;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
