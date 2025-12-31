package com.lifeevent.lid.customer.service.impl;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.customer.dto.CustomerDto;
import com.lifeevent.lid.customer.entity.Customer;
import com.lifeevent.lid.customer.repository.CustomerRepository;
import com.lifeevent.lid.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CustomerServiceImpl implements CustomerService {
    
    private final CustomerRepository customerRepository;
    
    @Override
    public CustomerDto createCustomer(CustomerDto dto) {
        log.info("Création d'un nouveau client: {}", dto.getLogin());
        
        if (customerRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("L'email existe déjà");
        }
        
        if (customerRepository.existsByLogin(dto.getLogin())) {
            throw new IllegalArgumentException("Le login existe déjà");
        }
        
        Customer customer = Customer.builder()
            .login(dto.getLogin())
            .firstName(dto.getFirstName())
            .lastName(dto.getLastName())
            .email(dto.getEmail())
            .build();
        
        Customer saved = customerRepository.save(customer);
        return mapToDto(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<CustomerDto> getCustomerById(Integer id) {
        return customerRepository.findById(id).map(this::mapToDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll()
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<CustomerDto> getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email).map(this::mapToDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<CustomerDto> getCustomerByLogin(String login) {
        return customerRepository.findByLogin(login).map(this::mapToDto);
    }
    
    @Override
    public CustomerDto updateCustomer(Integer id, CustomerDto dto) {
        log.info("Mise à jour du client: {}", id);
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id.toString()));
        
        if (dto.getFirstName() != null) customer.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) customer.setLastName(dto.getLastName());
        if (dto.getEmail() != null) customer.setEmail(dto.getEmail());
        
        Customer updated = customerRepository.save(customer);
        return mapToDto(updated);
    }
    
    @Override
    public void deleteCustomer(Integer id) {
        log.info("Suppression du client: {}", id);
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer", "id", id.toString());
        }
        customerRepository.deleteById(id);
    }
    
    @Override
    public boolean emailExists(String email) {
        return customerRepository.existsByEmail(email);
    }
    
    @Override
    public boolean loginExists(String login) {
        return customerRepository.existsByLogin(login);
    }
    
    public CustomerDto mapToDto(Customer customer) {
        return CustomerDto.builder()
            .id(customer.getId())
            .login(customer.getLogin())
            .firstName(customer.getFirstName())
            .lastName(customer.getLastName())
            .email(customer.getEmail())
            .build();
    }
}
