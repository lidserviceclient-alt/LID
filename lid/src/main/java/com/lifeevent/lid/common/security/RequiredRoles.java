package com.lifeevent.lid.common.security;

import java.lang.annotation.*;

/**
 * Annotation personnalisée pour documenter les rôles requis pour un endpoint
 * Utilisée en complément de @PreAuthorize pour la documentation
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequiredRoles {
    
    /**
     * Les rôles requis pour accéder à cet endpoint
     */
    String[] value();
    
    /**
     * Description de pourquoi ce rôle est requis
     */
    String reason() default "";
}
