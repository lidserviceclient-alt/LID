package com.lifeevent.lid.auth.config;

import com.lifeevent.lid.auth.config.converter.LidRoleConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.client.RestTemplate;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfig {

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    @Bean
    @Order(1)
    SecurityFilterChain authChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .securityMatcher("/api/v1/auth/**", "/api/auth/**")
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
                .csrf(AbstractHttpConfigurer::disable)
                .build();
    }

    @Bean
    @Order(2)
    SecurityFilterChain apiChain(HttpSecurity http,
                                 JwtDecoder lidApplicationDecoder) throws Exception {
        boolean isLocal = isLocalProfile();

        return http
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers(
                            "/swagger-ui/**",
                            "/swagger-ui.html",
                            "/v3/api-docs/**",
                            "/actuator/**",
                            "/uploads/**"
                    ).permitAll();

                    auth.requestMatchers(
                            "/api/v1/webhooks/**",
                            "/api/v1/payments/verify/**",
                            "/api/v1/public/**",
                            "/api/v1/blog/**",
                            "/api/v1/tickets/**",
                            "/api/v1/partners/register/step-1",
                            "/api/v1/catalog/**",
                            "/api/v1/articles/search/**",
                            "/api/v1/newsletter/**",
                            "/api/v1/storage/**",
                            "/api/v1/cdn/**",
                            // alias pour la migration
                            "/api/webhooks/**",
                            "/api/payments/verify/**",
                            "/api/public/**",
                            "/api/blog/**",
                            "/api/tickets/**",
                            "/api/partners/register/step-1",
                            "/api/catalog/**",
                            "/api/articles/search/**",
                            "/api/newsletter/**"
                    ).permitAll();

                    if (isLocal) {
                        auth.requestMatchers("/api/v1/checkout/**", "/api/checkout/**").permitAll();
                        auth.requestMatchers(HttpMethod.GET, "/api/v1/articles/**", "/api/articles/**").permitAll();
                    }

                    auth.requestMatchers("/api/backoffice/logistics/**", "/api/v1/backoffice/logistics/**")
                            .hasAnyRole("ADMIN", "SUPER_ADMIN", "LIVREUR");
                    auth.requestMatchers("/api/backoffice/notifications/**", "/api/v1/backoffice/notifications/**")
                            .hasAnyRole("ADMIN", "SUPER_ADMIN", "LIVREUR");
                    auth.requestMatchers("/api/backoffice/partners/me/**", "/api/v1/backoffice/partners/me/**")
                            .hasAnyRole("PARTNER", "ADMIN", "SUPER_ADMIN");
                    auth.requestMatchers("/api/backoffice/**", "/api/v1/backoffice/**")
                            .hasAnyRole("ADMIN", "SUPER_ADMIN");

                    auth.anyRequest().authenticated();
                })
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt
                        .decoder(lidApplicationDecoder)
                        .jwtAuthenticationConverter(jwtLidAuthenticationConverter())
                ))
                .csrf(AbstractHttpConfigurer::disable)
                .build();
    }

    @Bean
    SecretKey secretKey(@Value("${config.security.app.secret}") String secret) {
        return new SecretKeySpec(secret.getBytes(), "HmacSHA256");
    }

    @Bean
    BearerTokenResolver bearerTokenResolver() {
        return new DefaultBearerTokenResolver();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    JwtDecoder googleJwtDecoder(@Value("${config.security.google.jwk-set-uri}") String jwtSetUri,
                                @Value("${config.security.google.client-id}") String googleClientId) {
        OAuth2TokenValidator<Jwt> audienceValidator = jwt -> {
            String clientId = googleClientId == null ? "" : googleClientId.trim();
            if (clientId.isBlank() || clientId.startsWith("local-") || isLocalProfile()) {
                return OAuth2TokenValidatorResult.success();
            }
            if (jwt.getAudience().contains(clientId)) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Invalid audience", null)
            );
        };

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(10000);
        RestTemplate restTemplate = new RestTemplate(requestFactory);

        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwtSetUri)
                .restOperations(restTemplate)
                .build();
        decoder.setJwtValidator(audienceValidator);
        return decoder;
    }

    @Bean
    JwtDecoder lidApplicationDecoder(SecretKey secretKey) {
        return NimbusJwtDecoder.withSecretKey(secretKey).build();
    }

    @Bean
    JwtAuthenticationConverter jwtLidAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new LidRoleConverter());
        return converter;
    }

    private boolean isLocalProfile() {
        return activeProfile != null && activeProfile.toLowerCase().contains("local");
    }
}
