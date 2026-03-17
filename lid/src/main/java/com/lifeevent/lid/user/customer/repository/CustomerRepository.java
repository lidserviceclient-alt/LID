package com.lifeevent.lid.user.customer.repository;

import com.lifeevent.lid.user.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {

    interface CustomerBasicView {
        String getUserId();
        String getEmail();
        String getFirstName();
        String getLastName();
        String getPhoneNumber();
    }
    
    /**
     * Recherche par email - charge UNIQUEMENT le Customer avec ses données spécifiques
     * Sans jointure inutile à la table parent si pas nécessaire
     */
    @Query("SELECT c FROM Customer c WHERE c.email = :email")
    Optional<Customer> findByEmail(@Param("email") String email);
    
    /**
     * Vérifier si un email existe dans les Customers - requête très légère
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Customer c WHERE c.email = :email")
    boolean existsByEmail(@Param("email") String email);
    
    /**
     * Récupérer un Customer par ID avec tous ses champs
     */
    @Query("SELECT c FROM Customer c WHERE c.userId = :userId")
    Optional<Customer> findByUserId(@Param("userId") String userId);

    @Query("SELECT c.email FROM Customer c WHERE c.email IS NOT NULL")
    List<String> findClientEmails();

    @Query("SELECT c.phoneNumber FROM Customer c WHERE c.phoneNumber IS NOT NULL")
    List<String> findClientPhones();

    @Query("""
        SELECT c.userId AS userId,
               c.email AS email,
               c.firstName AS firstName,
               c.lastName AS lastName,
               c.phoneNumber AS phoneNumber
        FROM Customer c
    """)
    List<CustomerBasicView> findAllBasic();

    @Query("""
        SELECT c.userId AS userId,
               c.email AS email,
               c.firstName AS firstName,
               c.lastName AS lastName,
               c.phoneNumber AS phoneNumber
        FROM Customer c
        WHERE (
            :q IS NULL OR :q = '' OR
            LOWER(CAST(c.email AS string)) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(CAST(c.firstName AS string)) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(CAST(c.lastName AS string)) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(CAST(c.phoneNumber AS string)) LIKE LOWER(CONCAT('%', :q, '%'))
        )
    """)
    List<CustomerBasicView> searchBasic(@Param("q") String q);
}
