package com.lifeevent.lid.auth.config.converter;

import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;

@Component
@RequiredArgsConstructor
public class GoogleScopeConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

        @Override
        public Collection<GrantedAuthority> convert(Jwt jwt) {

            String email = jwt.getClaimAsString("email");
            if (email == null) {
                return List.of();
            }

//            return userRepository.findByEmail(email)
//                    .map(user -> List.of(
//                            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
//                    ))
//                    .orElse(List.of());

            return List.of(
                    new SimpleGrantedAuthority("ROLE_ADMIN")
            );
        }
}


