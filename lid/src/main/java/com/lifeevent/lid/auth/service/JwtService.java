package com.lifeevent.lid.auth.service;

import com.lifeevent.lid.auth.dto.UserJwt;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JwtService {
    private final SecretKey secretKey;

    @Value("${config.security.app.issuer}")
    private String issuer;

    @Value("${config.security.app.access-ttl-minutes}")
    private long accessTtlMinutes;

    public String generateAccessToken(String userId, String email, List<String> roles){
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(accessTtlMinutes * 60);

        return Jwts.builder()
                .issuer(issuer)
                .subject(userId)
                .claim("email", email)
                .claim("roles", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(secretKey)
                .compact();
    }

    public UserJwt extractUserFromJwt(Jwt jwt, List<String> roles) {

        return UserJwt.builder()
                .userId(jwt.getSubject())
                .email(jwt.getClaimAsString("email"))
                .emailVerified(jwt.getClaimAsBoolean("email_verified"))
                .fullName(jwt.getClaimAsString("name"))
                .firstName(jwt.getClaimAsString("given_name"))
                .lastName(jwt.getClaimAsString("family_name"))
                .avatarUrl(jwt.getClaimAsString("picture"))
                .roles(roles)
                .build();
    }


}
