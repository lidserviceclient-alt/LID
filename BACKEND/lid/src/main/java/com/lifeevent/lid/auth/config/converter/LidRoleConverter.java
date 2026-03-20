package com.lifeevent.lid.auth.config.converter;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class LidRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Object rolesClaim = jwt.getClaims().get("roles");
        if (rolesClaim == null) {
            rolesClaim = jwt.getClaims().get("role");
        }
        if (rolesClaim == null) {
            return List.of();
        }

        Stream<String> roles;
        if (rolesClaim instanceof String roleString) {
            roles = Stream.of(roleString.split(","));
        } else if (rolesClaim instanceof Collection<?> roleCollection) {
            roles = roleCollection.stream().filter(Objects::nonNull).map(Object::toString);
        } else if (rolesClaim instanceof Object[] roleArray) {
            roles = Stream.of(roleArray).filter(Objects::nonNull).map(Object::toString);
        } else {
            roles = Stream.of(rolesClaim.toString());
        }

        Set<String> authorities = new LinkedHashSet<>();
        roles.map(String::trim)
                .filter(role -> !role.isBlank())
                .map(this::normalizeRole)
                .filter(Objects::nonNull)
                .forEach(authorities::add);

        return authorities.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    private String normalizeRole(String role) {
        if (role == null) {
            return null;
        }
        String normalized = role.trim();
        if (normalized.isBlank()) {
            return null;
        }

        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring("ROLE_".length());
        }

        normalized = switch (normalized) {
            case "CLIENT" -> "CUSTOMER";
            case "PARTENAIRE" -> "PARTNER";
            default -> normalized;
        };

        return "ROLE_" + normalized;
    }
}
