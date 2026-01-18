package com.lifeevent.lid.user.common.service;


import com.lifeevent.lid.user.common.dto.UserDto;

import java.util.List;
import java.util.Optional;

public interface UserService {

    /**
     * Récupérer un utilisateur par ID (sans distinction de type)
     * Utilise une requête optimisée SANS jointure aux sous-classes
     */
    UserDto getUserById(String id);
    
    /**
     * Lister tous les utilisateurs (Parents + Enfants via discriminator)
     * Requête optimisée sans jointures inutiles
     */
    List<UserDto> getAllUsers();
    
    /**
     * Recherche par email sur TOUS les utilisateurs
     * (Customer, Admin, etc - tous les UserEntity)
     */
    Optional<UserDto> getUserByEmail(String email);

    /**
     * Vérifier si un email existe PARMI TOUS les utilisateurs
     * Requête très légère, aucune jointure
     */
    boolean emailExists(String email);

}
