package com.lifeevent.lid.auth.config.converter;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;


public class LidRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
    @Override
    public Collection<GrantedAuthority> convert(Jwt source) {
        Object rolesClaim = source.getClaims().get("roles");
        if (rolesClaim == null) {
            return List.of();
        }

        List<String> roles;
        if (rolesClaim instanceof List) {
            roles = ((List<?>) rolesClaim).stream()
                    .map(String::valueOf)
                    .collect(Collectors.toList());
        } else {
            roles = List.of(rolesClaim.toString());
        }

        return roles.stream()
                .map(String::trim)
                .filter(role -> !role.isEmpty())
                .map(role -> role.toUpperCase(Locale.ROOT))
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }
}
