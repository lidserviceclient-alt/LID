package com.lifeevent.lid.common.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration OpenAPI/Swagger pour la documentation de l'API LID
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "LID - Life Event Distribution API",
        version = "1.0.0",
        description = "API REST complète pour la gestion d'une plateforme d'e-commerce de distribution d'événements",
        contact = @Contact(
            name = "LID Team",
            email = "support@lid.com"
        ),
        license = @License(
            name = "Apache 2.0"
        )
    ),
    servers = {
        @Server(
            url = "http://localhost:9000",
            description = "Development Server"
        ),
        @Server(
            url = "https://new.jean-emmanuel-diap.com/lid",
            description = "Production Server"
        )
    }
)
@SecurityScheme(
    name = "Bearer Token",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "Enter your JWT token",
    in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
    // Configuration will be auto-discovered by springdoc-openapi
}
