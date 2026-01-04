package com.lifeevent.lid.common.util;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

/**
 * Classe utilitaire pour gérer les réponses HTTP et les exceptions
 */
public class ResponseUtils {
    
    private ResponseUtils() {
        // Utility class
    }
    
    /**
     * Retourne la réponse OK ou NOT_FOUND
     */
    public static <T> ResponseEntity<T> getOrNotFound(Optional<T> resource, String resourceName, String identifier) {
        return resource.map(ResponseEntity::ok)
            .orElseThrow(() -> new ResourceNotFoundException(resourceName, "id", identifier));
    }
    
    /**
     * Retourne la réponse OK ou NOT_FOUND avec identifiant custom
     */
    public static <T> ResponseEntity<T> getOrNotFound(Optional<T> resource, String resourceName, String fieldName, String identifier) {
        return resource.map(ResponseEntity::ok)
            .orElseThrow(() -> new ResourceNotFoundException(resourceName, fieldName, identifier));
    }
    
    /**
     * Vérifie que la ressource existe, sinon lance une exception
     */
    public static <T> T getOrThrow(Optional<T> resource, String resourceName, String identifier) {
        return resource.orElseThrow(() -> new ResourceNotFoundException(resourceName, "id", identifier));
    }
    
    /**
     * Vérifie que la ressource existe avec fieldName custom
     */
    public static <T> T getOrThrow(Optional<T> resource, String resourceName, String fieldName, String identifier) {
        return resource.orElseThrow(() -> new ResourceNotFoundException(resourceName, fieldName, identifier));
    }
}
