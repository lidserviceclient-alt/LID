package com.lifeevent.lid.user.common.service.impl;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.user.common.dto.UserDto;
import com.lifeevent.lid.user.common.mapper.UserMapper;
import com.lifeevent.lid.user.common.repository.UserEntityRepository;
import com.lifeevent.lid.user.common.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service générique pour les UserEntity
 * 
 * Stratégie :
 * - Utilise des requêtes SANS jointures aux sous-classes (Customer, Admin, etc)
 * - Charge UNIQUEMENT les colonnes de UserEntity, pas celles des enfants
 * - Les services enfants (CustomerService, etc) gèrent leurs données spécifiques
 * - Performance optimisée pour les requêtes fréquentes sur la table parent
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    
    private final UserEntityRepository userEntityRepository;
    private final UserMapper userMapper;

    /**
     * Récupérer un utilisateur par ID
     * Requête directe sur UserEntity, pas de jointure à Customer/Admin/etc
     */
    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(String id) {
        log.debug("Récupération de l'utilisateur: {}", id);
        return userEntityRepository.findById(id)
            .map(userMapper::toDto)
            .orElseThrow(() -> new ResourceNotFoundException("User", "userId", id));
    }
    
    /**
     * Récupérer tous les utilisateurs
     * Charge TOUS les UserEntity (parents + enfants via discriminator)
     * MAIS SANS jointure à chaque sous-classe
     */
    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        log.debug("Récupération de tous les utilisateurs");
        return userMapper.toDtoList(userEntityRepository.findAll());
    }
    
    /**
     * Recherche par email sur TOUS les utilisateurs
     * Requête optimisée sans jointure
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<UserDto> getUserByEmail(String email) {
        log.debug("Recherche utilisateur par email: {}", email);
        return userEntityRepository.findByEmail(email)
            .map(userMapper::toDto);
    }
    
    /**
     * Vérifier si un email existe
     * Requête très légère - COUNT sans join
     */
    @Override
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userEntityRepository.existsByEmail(email);
    }
}
