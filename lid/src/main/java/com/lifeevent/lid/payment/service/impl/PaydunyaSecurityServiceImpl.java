package com.lifeevent.lid.payment.service.impl;

import com.lifeevent.lid.payment.config.PaydunyaProperties;
import com.lifeevent.lid.payment.service.PaydunyaSecurityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Implémentation du service de sécurité PayDunya
 * Gère la validation des hashs et la sécurité des requêtes
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaydunyaSecurityServiceImpl implements PaydunyaSecurityService {
    
    private final PaydunyaProperties properties;
    
    @Override
    public boolean validateHash(String hash, String data) {
        try {
            String expectedHash = generateHashSHA512(data);
            return hash.equals(expectedHash);
        } catch (Exception e) {
            log.error("Erreur lors de la validation du hash", e);
            return false;
        }
    }
    
    @Override
    public String generateHash(String masterKey) {
        return generateHashSHA512(masterKey);
    }
    
    @Override
    public boolean isValidPaydunyaRequest(String hash) {
        try {
            String expectedHash = generateHashSHA512(properties.getMasterKey());
            return hash.equals(expectedHash);
        } catch (Exception e) {
            log.error("Erreur lors de la validation de la requête PayDunya", e);
            return false;
        }
    }
    
    /**
     * Génère un hash SHA-512
     */
    private String generateHashSHA512(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            byte[] messageDigest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : messageDigest) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("Algorithme SHA-512 non disponible", e);
            throw new RuntimeException("Erreur lors de la génération du hash", e);
        }
    }
}
