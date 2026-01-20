package com.lifeevent.lid.user.customer.service.impl;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.user.customer.dto.CustomerDto;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.mapper.CustomerMapper;
import com.lifeevent.lid.user.customer.service.CustomerService;
import com.lifeevent.lid.user.common.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service Customer - délègue les opérations génériques à UserService,
 * ne gère que la logique spécifique au Customer (avatar, etc)
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CustomerServiceImpl implements CustomerService {
    
    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final UserService userService;
    
    @Override
    public CustomerDto createCustomer(CustomerDto dto) {
        log.info("Création d'un nouveau client: {}", dto.getLastName());
        
        // Vérifier l'email via UserService (pas de doublon)
        if (userService.emailExists(dto.getEmail())) {
            throw new IllegalArgumentException("L'email existe déjà");
        }
        
        Customer customer = customerMapper.toEntity(dto);
        Customer saved = customerRepository.save(customer);
        return customerMapper.toDto(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<CustomerDto> getCustomerById(String id) {
        // Utiliser CustomerRepository uniquement pour obtenir le Customer complet
        return customerRepository.findById(id)
            .map(customerMapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CustomerDto> getAllCustomers() {
        // Requête optimisée qui charge UNIQUEMENT les Customers, pas tous les UserEntity
        return customerMapper.toDtoList(customerRepository.findAll());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<CustomerDto> getCustomerByEmail(String email) {
        // Chercher spécifiquement dans les Customers
        return customerRepository.findByEmail(email)
            .map(customerMapper::toDto);
    }

    
    @Override
    public CustomerDto updateCustomer(String id, CustomerDto dto) {
        log.info("Mise à jour du client: {}", id);
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        
        customerMapper.updateEntityFromDto(dto, customer);
        Customer updated = customerRepository.save(customer);
        return customerMapper.toDto(updated);
    }
    
    @Override
    public void deleteCustomer(String id) {
        log.info("Suppression du client: {}", id);
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer", "id", id);
        }
        customerRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        // Déléguer à UserService pour vérifier TOUT utilisateur (Customer ou autre)
        return userService.emailExists(email);
    }
}
