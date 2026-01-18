package com.lifeevent.lid.auth.config;

import com.lifeevent.lid.auth.config.converter.GoogleScopeConverter;
import com.lifeevent.lid.auth.config.converter.LidRoleConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.List;

/**
 * Configuration de sécurité Spring Security
 * - OAuth2 JWT (Google + LID tokens)
 * - Method-level security avec @PreAuthorize
 * - CORS configuré pour le développement local
 */
@Configuration
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfig {

    @Value("${spring.profiles.active}")
    private String activeProfile;

    @Bean
    @Order(1)
    SecurityFilterChain authChain(HttpSecurity http) throws Exception {
        if("local".equals(activeProfile)){
            http.cors(corsSpec -> corsSpec.configurationSource(corsConfigurationSource()));
        }
        return http
                .securityMatcher("/api/v1/auth/**")
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )
                .csrf(AbstractHttpConfigurer::disable)
                .build();
    }

    @Bean
    @Order(2)
    SecurityFilterChain apiChain(HttpSecurity http,JwtDecoder lidApplicationDecoder) throws Exception {
        if("local".equals(activeProfile)){
            http.cors(corsSpec -> corsSpec.configurationSource(corsConfigurationSource()));
        }
        return http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/swagger-ui/**","/v3/api-docs/**","/actuator/**").permitAll()
                        .requestMatchers("/api/v1/partners/register/**", "/api/v1/catalog/**").permitAll()
                        .requestMatchers("/api/v1/articles/search/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt -> jwt
                                .decoder(lidApplicationDecoder)
                                .jwtAuthenticationConverter(jwtLidAuthenticationConverter())
                        )
                )
                .csrf(AbstractHttpConfigurer::disable)
                .build();
    }





    @Bean
    SecretKey secretKey(@Value("${config.security.app.secret}") String secretKey){
        return new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
    }

    @Bean
    BearerTokenResolver bearerTokenResolver(){
        return new DefaultBearerTokenResolver();
    }


    @Bean
    JwtDecoder googleJwtDecoder(@Value("${config.security.google.jwk-set-uri}") String jwtSetUri,
                                @Value("${config.security.google.client-id}") String googleClientId){
        OAuth2TokenValidator<Jwt> audienceValidator = jwt -> {
            if (jwt.getAudience().contains(googleClientId)) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Invalid audience", null)
            );
        };
        var decoder = NimbusJwtDecoder.withJwkSetUri(jwtSetUri).build();
        decoder.setJwtValidator(audienceValidator);
        return decoder;
    }


    @Bean
    JwtDecoder lidApplicationDecoder(SecretKey secretKey){
        return NimbusJwtDecoder.withSecretKey(secretKey).build();
    }



    @Bean
    JwtAuthenticationConverter jwtGoogleAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new GoogleScopeConverter());
        return converter;
    }

    @Bean
    JwtAuthenticationConverter jwtLidAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new LidRoleConverter());
        return converter;
    }



    @Bean
    @Profile("local")
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();

        // Autorise localhost sur n'importe quel port (4200, 3000, etc.)
        cors.setAllowedOriginPatterns(List.of("http://localhost:*"));

        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("*"));
        cors.setAllowCredentials(true);
        cors.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }





}
