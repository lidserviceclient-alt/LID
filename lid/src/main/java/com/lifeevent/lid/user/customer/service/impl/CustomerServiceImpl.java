package com.lifeevent.lid.user.customer.service.impl;

import com.lifeevent.lid.cart.service.CartService;
import com.lifeevent.lid.auth.repository.AuthenticationRepository;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.user.customer.dto.CustomerAddressDto;
import com.lifeevent.lid.user.customer.dto.CustomerDto;
import com.lifeevent.lid.user.customer.entity.CustomerAddress;
import com.lifeevent.lid.user.customer.mapper.CustomerAddressMapper;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import com.lifeevent.lid.user.customer.repository.CustomerAddressRepository;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.mapper.CustomerMapper;
import com.lifeevent.lid.user.common.entity.UserEntity;
import com.lifeevent.lid.user.common.repository.UserEntityRepository;
import com.lifeevent.lid.user.customer.service.CustomerService;
import com.lifeevent.lid.user.common.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
    private final CustomerAddressRepository customerAddressRepository;
    private final CustomerMapper customerMapper;
    private final CustomerAddressMapper customerAddressMapper;
    private final UserEntityRepository userEntityRepository;
    private final AuthenticationRepository authenticationRepository;
    private final UserService userService;
    private final CartService cartService;
    
    @Override
    public CustomerDto createCustomer(CustomerDto dto) {
        log.info("Création d'un nouveau client: {}", dto.getLastName());
        
        // Vérifier l'email via UserService (pas de doublon)
        if (userService.emailExists(dto.getEmail())) {
            throw new IllegalArgumentException("L'email existe déjà");
        }
        
        Customer customer = customerMapper.toEntity(dto);
        String userId = customer.getUserId() == null || customer.getUserId().isBlank()
                ? UUID.randomUUID().toString()
                : customer.getUserId();
        UserEntity user = userEntityRepository.save(UserEntity.builder()
                .userId(userId)
                .email(dto.getEmail())
                .emailVerified(Boolean.FALSE)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .blocked(Boolean.FALSE)
                .build());
        customer.setUser(user);
        Customer saved = customerRepository.save(customer);
        userService.upsertCustomerProfile(saved);
        cartService.createCart(saved.getUserId());
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
    public Page<CustomerDto> getAllCustomers(Pageable pageable) {
        return customerRepository.findAll(pageable).map(customerMapper::toDto);
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
        userService.upsertCustomerProfile(updated);
        return customerMapper.toDto(updated);
    }
    
    @Override
    public void deleteCustomer(String id) {
        log.info("Suppression du client: {}", id);
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer", "id", id);
        }
        customerRepository.deleteById(id);
        authenticationRepository.findById(id).ifPresent(authenticationRepository::delete);
        userEntityRepository.findById(id).ifPresent(userEntityRepository::delete);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        // Déléguer à UserService pour vérifier TOUT utilisateur (Customer ou autre)
        return userService.emailExists(email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerAddressDto> listAddresses(String customerId) {
        return customerAddressMapper.toDtoList(
                customerAddressRepository.findByCustomer_UserIdOrderByCreatedAtDesc(customerId)
        );
    }

    @Override
    public CustomerAddressDto createAddress(String customerId, CustomerAddressDto dto) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));

        CustomerAddress entity = customerAddressMapper.toEntity(dto);
        entity.setId(UUID.randomUUID().toString());
        entity.setCustomer(customer);
        if (entity.getIsDefault() == null) {
            entity.setIsDefault(Boolean.FALSE);
        }
        if (Boolean.TRUE.equals(entity.getIsDefault())) {
            unsetDefaultAddresses(customerId);
        }
        CustomerAddress saved = customerAddressRepository.save(entity);
        return customerAddressMapper.toDto(saved);
    }

    @Override
    public CustomerAddressDto updateAddress(String customerId, String addressId, CustomerAddressDto dto) {
        CustomerAddress entity = findAddressOrThrow(customerId, addressId);
        customerAddressMapper.updateEntityFromDto(dto, entity);
        if (entity.getIsDefault() == null) {
            entity.setIsDefault(Boolean.FALSE);
        }
        if (Boolean.TRUE.equals(entity.getIsDefault())) {
            unsetDefaultAddresses(customerId);
            entity.setIsDefault(Boolean.TRUE);
        }
        CustomerAddress saved = customerAddressRepository.save(entity);
        return customerAddressMapper.toDto(saved);
    }

    @Override
    public CustomerAddressDto setDefaultAddress(String customerId, String addressId) {
        CustomerAddress entity = findAddressOrThrow(customerId, addressId);
        unsetDefaultAddresses(customerId);
        entity.setIsDefault(Boolean.TRUE);
        CustomerAddress saved = customerAddressRepository.save(entity);
        return customerAddressMapper.toDto(saved);
    }

    @Override
    public void deleteAddress(String customerId, String addressId) {
        CustomerAddress entity = findAddressOrThrow(customerId, addressId);
        customerAddressRepository.delete(entity);
    }

    private CustomerAddress findAddressOrThrow(String customerId, String addressId) {
        CustomerAddress address = customerAddressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("CustomerAddress", "id", addressId));
        String ownerId = address.getCustomer() != null ? address.getCustomer().getUserId() : null;
        if (!customerId.equals(ownerId)) {
            throw new ResourceNotFoundException("CustomerAddress", "id", addressId);
        }
        return address;
    }

    private void unsetDefaultAddresses(String customerId) {
        List<CustomerAddress> defaults = customerAddressRepository.findByCustomer_UserIdAndIsDefaultTrue(customerId);
        for (CustomerAddress address : defaults) {
            address.setIsDefault(Boolean.FALSE);
        }
        if (!defaults.isEmpty()) {
            customerAddressRepository.saveAll(defaults);
        }
    }
}
