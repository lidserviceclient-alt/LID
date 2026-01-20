package com.lifeevent.lid.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Collection;

/**
 * Utilitaire pour gérer l'authentification courante et les rôles
 */
@Component
public class SecurityUtils {
    
    /**
     * Récupère l'utilisateur actuellement authentifié
     */
    public static String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }
        return null;
    }
    
    /**
     * Vérifie si l'utilisateur a un rôle spécifique
     */
    public static boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        return auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch(authority -> authority.equals(role) || authority.equals("ROLE_" + role));
    }
    
    /**
     * Vérifie si l'utilisateur a AU MOINS un des rôles spécifiés
     */
    public static boolean hasAnyRole(String... roles) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        for (String role : roles) {
            String roleWithPrefix = role.startsWith("ROLE_") ? role : "ROLE_" + role;
            if (authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> authority.equals(roleWithPrefix))) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Récupère tous les rôles de l'utilisateur courant
     */
    public static Collection<? extends GrantedAuthority> getCurrentRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getAuthorities();
        }
        return java.util.Collections.emptyList();
    }
    
    /**
     * Vérifie si l'utilisateur est un ADMIN
     */
    public static boolean isAdmin() {
        return hasRole(RoleConstants.ROLE_ADMIN);
    }
    
    /**
     * Vérifie si l'utilisateur est un CUSTOMER
     */
    public static boolean isCustomer() {
        return hasRole(RoleConstants.ROLE_CUSTOMER);
    }
    
    /**
     * Vérifie si l'utilisateur est un PARTNER
     */
    public static boolean isPartner() {
        return hasRole(RoleConstants.ROLE_PARTNER);
    }
    
    /**
     * Vérifie si l'utilisateur a une authentification valide (non-anonymous)
     */
    public static boolean isAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && 
               !auth.getName().equals("anonymousUser");
    }
}
