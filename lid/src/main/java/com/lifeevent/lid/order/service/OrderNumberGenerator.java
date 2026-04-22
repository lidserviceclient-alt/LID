package com.lifeevent.lid.order.service;

import com.lifeevent.lid.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
@RequiredArgsConstructor
public class OrderNumberGenerator {

    private static final String PREFIX = "ORD-";
    private static final String ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final int MAX_ATTEMPTS = 20;

    private final OrderRepository orderRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public String generateUnique() {
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            String candidate = PREFIX + block() + "-" + block();
            if (!orderRepository.existsByOrderNumber(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Impossible de générer un numéro de commande unique");
    }

    private String block() {
        StringBuilder value = new StringBuilder(4);
        for (int i = 0; i < 4; i++) {
            value.append(ALPHABET.charAt(secureRandom.nextInt(ALPHABET.length())));
        }
        return value.toString();
    }
}
