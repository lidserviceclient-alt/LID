package com.lifeevent.lid.customer.service.impl;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.customer.dto.CustomerDto;
import com.lifeevent.lid.customer.entity.Customer;
import com.lifeevent.lid.customer.mapper.CustomerMapper;
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
    private final CustomerMapper customerMapper;
    
    @Override
    public CustomerDto createCustomer(CustomerDto dto) {
        log.info("Création d'un nouveau client: {}", dto.getLogin());
        
        if (customerRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("L'email existe déjà");
        }
        
        if (customerRepository.existsByLogin(dto.getLogin())) {
            throw new IllegalArgumentException("Le login existe déjà");
        }
        
        Customer customer = customerMapper.toEntity(dto);
        Customer saved = customerRepository.save(customer);
        return customerMapper.toDto(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<CustomerDto> getCustomerById(Integer id) {
        return customerRepository.findById(id).map(customerMapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CustomerDto> getAllCustomers() {
        return customerMapper.toDtoList(customerRepository.findAll());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<CustomerDto> getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email).map(customerMapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<CustomerDto> getCustomerByLogin(String login) {
        return customerRepository.findByLogin(login).map(customerMapper::toDto);
    }
    
    @Override
    public CustomerDto updateCustomer(Integer id, CustomerDto dto) {
        log.info("Mise à jour du client: {}", id);
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id.toString()));
        
        customerMapper.updateEntityFromDto(dto, customer);
        Customer updated = customerRepository.save(customer);
        return customerMapper.toDto(updated);
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
}
