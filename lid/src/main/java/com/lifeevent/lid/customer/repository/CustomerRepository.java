package com.lifeevent.lid.customer.repository;

import com.lifeevent.lid.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    
    /**
     * Recherche par email
     */
    Optional<Customer> findByEmail(String email);
    
    /**
     * Recherche par login
     */
    Optional<Customer> findByLogin(String login);
    
    /**
     * Vérifier si un email existe
     */
    boolean existsByEmail(String email);
    
    /**
     * Vérifier si un login existe
     */
    boolean existsByLogin(String login);
}
