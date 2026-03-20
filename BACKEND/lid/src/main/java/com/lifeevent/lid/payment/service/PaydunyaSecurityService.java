package com.lifeevent.lid.payment.service;

/**
 * Interface pour les opérations de sécurité et validation PayDunya
 */
public interface PaydunyaSecurityService {
    
    /**
     * Valide le hash de sécurité reçu de PayDunya
     */
    boolean validateHash(String hash, String data);
    
    /**
     * Génère un hash SHA-512 pour la vérification
     */
    String generateHash(String masterKey);
    
    /**
     * Valide que la requête provient bien de PayDunya
     */
    boolean isValidPaydunyaRequest(String hash);
}
