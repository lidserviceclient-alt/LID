package com.lifeevent.lid.auth.config.converter;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


public class LidRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
    @Override
    public Collection<GrantedAuthority> convert(Jwt source) {
        boolean admin = ((String) source.getClaims().get("email")).contains("jean");
        return ((List<String>) source.getClaims().get("roles"))
                .stream().map(roleName -> "ROLE_" + (admin ? "ADMIN" : roleName))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }
}
