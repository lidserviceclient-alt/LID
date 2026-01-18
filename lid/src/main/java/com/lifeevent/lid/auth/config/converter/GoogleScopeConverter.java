package com.lifeevent.lid.auth.config.converter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class GoogleScopeConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

        @Override
        public Collection<GrantedAuthority> convert(Jwt jwt) {

            log.info("🔥 GoogleScopeConverter CALLED");
            log.info("JWT claims: {}", jwt.getClaims());

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


