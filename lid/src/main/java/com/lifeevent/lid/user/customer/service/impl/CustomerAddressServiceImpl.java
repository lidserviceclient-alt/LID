package com.lifeevent.lid.user.customer.service.impl;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.core.entity.CustomerAddress;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.repository.CustomerAddressRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import com.lifeevent.lid.user.customer.dto.CustomerAddressDto;
import com.lifeevent.lid.user.customer.service.CustomerAddressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CustomerAddressServiceImpl implements CustomerAddressService {

    private final CustomerAddressRepository addressRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CustomerAddressDto> listAddresses(String customerId) {
        ensureCustomer(customerId);
        return addressRepository.findByUtilisateur_Id(customerId).stream()
            .sorted(Comparator.comparing((CustomerAddress a) -> Boolean.TRUE.equals(a.getIsDefault()) ? 0 : 1)
                .thenComparing(CustomerAddress::getDateCreation, Comparator.nullsLast(Comparator.naturalOrder())))
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public CustomerAddressDto createAddress(String customerId, CustomerAddressDto dto) {
        Utilisateur utilisateur = ensureCustomer(customerId);
        CustomerAddress address = new CustomerAddress();
        address.setUtilisateur(utilisateur);
        applyDto(address, dto);
        boolean shouldBeDefault = Boolean.TRUE.equals(dto.getIsDefault()) || !addressRepository.existsByUtilisateur_IdAndIsDefaultTrue(customerId);
        if (shouldBeDefault) {
            unsetDefaults(customerId);
            address.setIsDefault(true);
        }
        CustomerAddress saved = addressRepository.save(address);
        return toDto(saved);
    }

    @Override
    public CustomerAddressDto updateAddress(String customerId, String addressId, CustomerAddressDto dto) {
        CustomerAddress address = addressRepository.findByUtilisateur_IdAndId(customerId, addressId)
            .orElseThrow(() -> new ResourceNotFoundException("CustomerAddress", "id", addressId));
        applyDto(address, dto);
        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            unsetDefaults(customerId);
            address.setIsDefault(true);
        }
        CustomerAddress saved = addressRepository.save(address);
        return toDto(saved);
    }

    @Override
    public void deleteAddress(String customerId, String addressId) {
        CustomerAddress address = addressRepository.findByUtilisateur_IdAndId(customerId, addressId)
            .orElseThrow(() -> new ResourceNotFoundException("CustomerAddress", "id", addressId));
        addressRepository.delete(address);
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            List<CustomerAddress> remaining = addressRepository.findByUtilisateur_Id(customerId);
            remaining.stream().findFirst().ifPresent(next -> {
                next.setIsDefault(true);
                addressRepository.save(next);
            });
        }
    }

    @Override
    public CustomerAddressDto setDefaultAddress(String customerId, String addressId) {
        CustomerAddress address = addressRepository.findByUtilisateur_IdAndId(customerId, addressId)
            .orElseThrow(() -> new ResourceNotFoundException("CustomerAddress", "id", addressId));
        unsetDefaults(customerId);
        address.setIsDefault(true);
        CustomerAddress saved = addressRepository.save(address);
        return toDto(saved);
    }

    private Utilisateur ensureCustomer(String customerId) {
        return utilisateurRepository.findById(customerId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));
    }

    private void unsetDefaults(String customerId) {
        List<CustomerAddress> addresses = addressRepository.findByUtilisateur_Id(customerId);
        for (CustomerAddress existing : addresses) {
            if (Boolean.TRUE.equals(existing.getIsDefault())) {
                existing.setIsDefault(false);
                addressRepository.save(existing);
            }
        }
    }

    private void applyDto(CustomerAddress address, CustomerAddressDto dto) {
        if (dto == null) return;
        if (dto.getType() != null) address.setType(dto.getType());
        if (dto.getName() != null) address.setName(dto.getName());
        if (dto.getAddressLine() != null) address.setAddressLine(dto.getAddressLine());
        if (dto.getCity() != null) address.setCity(dto.getCity());
        if (dto.getPostalCode() != null) address.setPostalCode(dto.getPostalCode());
        if (dto.getCountry() != null) address.setCountry(dto.getCountry());
        if (dto.getPhone() != null) address.setPhone(dto.getPhone());
        if (dto.getIsDefault() != null) address.setIsDefault(dto.getIsDefault());
    }

    private CustomerAddressDto toDto(CustomerAddress address) {
        return CustomerAddressDto.builder()
            .id(address.getId())
            .customerId(address.getUtilisateur() != null ? address.getUtilisateur().getId() : null)
            .type(address.getType())
            .name(address.getName())
            .addressLine(address.getAddressLine())
            .city(address.getCity())
            .postalCode(address.getPostalCode())
            .country(address.getCountry())
            .phone(address.getPhone())
            .isDefault(address.getIsDefault())
            .build();
    }
}
