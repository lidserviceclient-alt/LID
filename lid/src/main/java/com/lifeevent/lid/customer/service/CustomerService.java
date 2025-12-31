package com.lifeevent.lid.customer.service;

import com.lifeevent.lid.customer.dto.CustomerDto;

import java.util.List;
import java.util.Optional;

public interface CustomerService {
    
    /**
     * Créer un client
     */
    CustomerDto createCustomer(CustomerDto dto);
    
    /**
     * Récupérer un client par ID
     */
    Optional<CustomerDto> getCustomerById(Integer id);
    
    /**
     * Lister tous les clients
     */
    List<CustomerDto> getAllCustomers();
    
    /**
     * Recherche par email
     */
    Optional<CustomerDto> getCustomerByEmail(String email);
    
    /**
     * Recherche par login
     */
    Optional<CustomerDto> getCustomerByLogin(String login);
    
    /**
     * Mettre à jour un client
     */
    CustomerDto updateCustomer(Integer id, CustomerDto dto);
    
    /**
     * Supprimer un client
     */
    void deleteCustomer(Integer id);
    
    /**
     * Vérifier si un email existe
     */
    boolean emailExists(String email);
    
    /**
     * Vérifier si un login existe
     */
    boolean loginExists(String login);
}
