package com.lifeevent.lid.user.customer.repository;

import com.lifeevent.lid.user.customer.entity.Customer;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    
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
     * Récupérer tous les Customers avec leur avatar
     */
    @Query("SELECT c FROM Customer c")
    List<Customer> findAll();
    
    /**
     * Récupérer un Customer par ID avec tous ses champs
     */
    @Query("SELECT c FROM Customer c WHERE c.userId = :userId")
    Optional<Customer> findByUserId(@Param("userId") String userId);
}
