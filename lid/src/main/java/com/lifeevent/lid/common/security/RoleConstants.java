package com.lifeevent.lid.common.security;

/**
 * Constantes pour les rôles de l'application LID
 * Les rôles sont préfixés par "ROLE_" au niveau du Spring Security
 */
public final class RoleConstants {
    
    private RoleConstants() {
        // Classe utilitaire
    }
    
    /**
     * ADMIN - Accès complet à l'application
     * - Tous les GET, POST, PUT, DELETE
     * - Gestion complète des utilisateurs
     * - Accès aux actuator et cache
     * - Peut corriger les problèmes
     */
    public static final String ADMIN = "ADMIN";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    
    /**
     * USER - Utilisateur anonyme/non connecté
     * - Accès lecture seule au catalogue (articles, catégories)
     * - Pas d'accès au panier
     * - Pas d'accès aux endpoints utilisateurs
     * - Pas de modification d'articles
     */
    public static final String USER = "USER";
    public static final String ROLE_USER = "ROLE_USER";
    
    /**
     * CUSTOMER - Client authentifié
     * - Tous les droits du USER
     * - Accès au panier (uniquement le sien)
     * - Accès à la wishlist (uniquement la sienne)
     * - Accès aux commandes (uniquement les siennes)
     * - Peut voir/modifier uniquement son profil
     * - Pas d'accès aux Partner endpoints
     */
    public static final String CUSTOMER = "CUSTOMER";
    public static final String ROLE_CUSTOMER = "ROLE_CUSTOMER";
    
    /**
     * PARTNER - Vendeur/Commerçant
     * - Tous les droits du USER pour le catalogue
     * - Peut créer/importer des articles
     * - Peut voir/modifier uniquement ses propres articles
     * - Accès aux endpoints Partner (voir/modifier profil)
     * - Peut suivre ses commandes/statistiques
     * - Pas d'accès aux Customer endpoints
     */
    public static final String PARTNER = "PARTNER";
    public static final String ROLE_PARTNER = "ROLE_PARTNER";
    
    // Groupes de rôles pour les vérifications communes
    
    /**
     * Rôles authentifiés : CUSTOMER, PARTNER, ADMIN
     */
    public static final String AUTHENTICATED_USERS = "ROLE_CUSTOMER,ROLE_PARTNER,ROLE_ADMIN";
    
    /**
     * Rôles avec accès complet : ADMIN
     */
    public static final String FULL_ACCESS = "ROLE_ADMIN";
    
    /**
     * Rôles utilisateurs (non-admin) : CUSTOMER, PARTNER
     */
    public static final String REGULAR_USERS = "ROLE_CUSTOMER,ROLE_PARTNER";
}
