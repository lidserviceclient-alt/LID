package com.lifeevent.lid.logistics.service;

import com.lifeevent.lid.logistics.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
@RequiredArgsConstructor
public class ShipmentHandoffCodeGenerator {

    private static final String ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final int CODE_LENGTH = 5;
    private static final int MAX_ATTEMPTS = 30;

    private final ShipmentRepository shipmentRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public String generateUnique() {
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            String candidate = generateCandidate();
            if (!shipmentRepository.existsByHandoffCodeIgnoreCase(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Impossible de générer un code QR unique pour l'expédition");
    }

    private String generateCandidate() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(ALPHABET.charAt(secureRandom.nextInt(ALPHABET.length())));
        }
        return code.toString();
    }
}
