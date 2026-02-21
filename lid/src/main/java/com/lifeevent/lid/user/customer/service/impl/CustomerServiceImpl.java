package com.lifeevent.lid.user.customer.service.impl;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.enums.RoleUtilisateur;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import com.lifeevent.lid.user.customer.dto.CustomerDto;
import com.lifeevent.lid.user.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Customer - Implémentation basée sur l'entité Utilisateur (lid.sql)
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CustomerServiceImpl implements CustomerService {
    
    private final UtilisateurRepository utilisateurRepository;
    
    @Override
    public CustomerDto createCustomer(CustomerDto dto) {
        log.info("Création d'un nouveau client: {}", dto.getLastName());
        
        if (utilisateurRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("L'email existe déjà");
        }
        
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setEmail(dto.getEmail());
        utilisateur.setNom(dto.getLastName());
        utilisateur.setPrenom(dto.getFirstName());
        utilisateur.setAvatarUrl(dto.getAvatarUrl());
        utilisateur.setTelephone(dto.getTelephone());
        utilisateur.setVille(dto.getVille());
        utilisateur.setPays(dto.getPays());
        utilisateur.setRole(RoleUtilisateur.CLIENT);
        // Note: Password/Auth is handled separately usually
        
        Utilisateur saved = utilisateurRepository.save(utilisateur);
        return toDto(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<CustomerDto> getCustomerById(String id) {
        return utilisateurRepository.findById(id).map(this::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CustomerDto> getAllCustomers() {
        return utilisateurRepository.findAll().stream()
                .filter(u -> u.getRole() == RoleUtilisateur.CLIENT)
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<CustomerDto> getCustomerByEmail(String email) {
        return utilisateurRepository.findByEmail(email).map(this::toDto);
    }

    
    @Override
    public CustomerDto updateCustomer(String id, CustomerDto dto) {
        log.info("Mise à jour du client: {}", id);
        Utilisateur utilisateur = utilisateurRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        
        if (dto.getFirstName() != null) utilisateur.setPrenom(dto.getFirstName());
        if (dto.getLastName() != null) utilisateur.setNom(dto.getLastName());
        if (dto.getAvatarUrl() != null) utilisateur.setAvatarUrl(dto.getAvatarUrl());
        if (dto.getTelephone() != null) utilisateur.setTelephone(dto.getTelephone());
        if (dto.getVille() != null) utilisateur.setVille(dto.getVille());
        if (dto.getPays() != null) utilisateur.setPays(dto.getPays());
        
        if (dto.getEmail() != null && !dto.getEmail().equals(utilisateur.getEmail())) {
             if (utilisateurRepository.findByEmail(dto.getEmail()).isPresent()) {
                 throw new IllegalArgumentException("Email already taken");
             }
             utilisateur.setEmail(dto.getEmail());
        }

        Utilisateur updated = utilisateurRepository.save(utilisateur);
        return toDto(updated);
    }
    
    @Override
    public void deleteCustomer(String id) {
        log.info("Suppression du client: {}", id);
        if (!utilisateurRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer", "id", id);
        }
        utilisateurRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return utilisateurRepository.findByEmail(email).isPresent();
    }

    private CustomerDto toDto(Utilisateur utilisateur) {
        return CustomerDto.builder()
                .userId(utilisateur.getId())
                .email(utilisateur.getEmail())
                .firstName(utilisateur.getPrenom())
                .lastName(utilisateur.getNom())
                .avatarUrl(utilisateur.getAvatarUrl())
                .telephone(utilisateur.getTelephone())
                .ville(utilisateur.getVille())
                .pays(utilisateur.getPays())
                .createdAt(utilisateur.getDateCreation())
                .build();
    }
}
