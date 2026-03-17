package com.lifeevent.lid.user.customer.service;

import com.lifeevent.lid.user.customer.dto.CustomerDto;
import com.lifeevent.lid.user.customer.dto.CustomerAddressDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
    Optional<CustomerDto> getCustomerById(String id);
    
    /**
     * Lister tous les clients
     */
    Page<CustomerDto> getAllCustomers(Pageable pageable);
    
    /**
     * Recherche par email
     */
    Optional<CustomerDto> getCustomerByEmail(String email);

    /**
     * Mettre à jour un client
     */
    CustomerDto updateCustomer(String id, CustomerDto dto);
    
    /**
     * Supprimer un client
     */
    void deleteCustomer(String id);
    
    /**
     * Vérifier si un email existe
     */
    boolean emailExists(String email);

    List<CustomerAddressDto> listAddresses(String customerId);

    CustomerAddressDto createAddress(String customerId, CustomerAddressDto dto);

    CustomerAddressDto updateAddress(String customerId, String addressId, CustomerAddressDto dto);

    CustomerAddressDto setDefaultAddress(String customerId, String addressId);

    void deleteAddress(String customerId, String addressId);

}
