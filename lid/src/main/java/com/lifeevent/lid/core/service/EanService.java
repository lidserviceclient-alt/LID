package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.repository.ProduitRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class EanService {

    private static final String INTERNAL_PREFIX_12 = "200";

    private final ProduitRepository produitRepository;

    public EanService(ProduitRepository produitRepository) {
        this.produitRepository = produitRepository;
    }

    public String ensureValidOrGenerate(String sku, String requestedEan) {
        String skuValue = sku == null ? "" : sku.trim();
        if (skuValue.isEmpty()) {
            throw new IllegalArgumentException("SKU requis pour générer l'EAN.");
        }
        String provided = requestedEan == null ? "" : requestedEan.trim();
        if (!provided.isEmpty()) {
            String normalized = normalizeDigits(provided);
            if (!isValidEan13(normalized)) {
                throw new IllegalArgumentException("EAN invalide.");
            }
            if (produitRepository.findByEanIgnoreCase(normalized).isPresent()) {
                throw new IllegalArgumentException("EAN déjà utilisé.");
            }
            return normalized;
        }

        for (int attempt = 0; attempt < 50; attempt++) {
            String ean = generateEan13(skuValue, attempt);
            if (produitRepository.findByEanIgnoreCase(ean).isEmpty()) {
                return ean;
            }
        }
        throw new IllegalStateException("Impossible de générer un EAN unique.");
    }

    public String regenerate(String sku) {
        return ensureValidOrGenerate(sku, null);
    }

    public static boolean isValidEan13(String value) {
        String s = normalizeDigits(value);
        if (s.length() != 13) return false;
        int sum = 0;
        for (int i = 0; i < 12; i++) {
            int digit = s.charAt(i) - '0';
            sum += (i % 2 == 0) ? digit : digit * 3;
        }
        int check = (10 - (sum % 10)) % 10;
        return check == (s.charAt(12) - '0');
    }

    public static String normalizeDigits(String value) {
        String raw = value == null ? "" : value.trim();
        StringBuilder sb = new StringBuilder(raw.length());
        for (int i = 0; i < raw.length(); i++) {
            char c = raw.charAt(i);
            if (c >= '0' && c <= '9') sb.append(c);
        }
        return sb.toString();
    }

    private static String generateEan13(String sku, int attempt) {
        String base9 = hashTo9Digits(sku + ":" + attempt);
        String base12 = INTERNAL_PREFIX_12 + base9;
        int check = computeCheckDigit(base12);
        return base12 + check;
    }

    private static int computeCheckDigit(String base12Digits) {
        if (base12Digits == null || base12Digits.length() != 12) {
            throw new IllegalArgumentException("Base EAN invalide.");
        }
        int sum = 0;
        for (int i = 0; i < 12; i++) {
            char c = base12Digits.charAt(i);
            if (c < '0' || c > '9') throw new IllegalArgumentException("Base EAN invalide.");
            int digit = c - '0';
            sum += (i % 2 == 0) ? digit : digit * 3;
        }
        return (10 - (sum % 10)) % 10;
    }

    private static String hashTo9Digits(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            long value = 0L;
            for (int i = 0; i < 8; i++) {
                value = (value << 8) | (digest[i] & 0xffL);
            }
            if (value < 0) value = -value;
            long mod = value % 1_000_000_000L;
            return String.format("%09d", mod);
        } catch (Exception e) {
            throw new IllegalStateException("Erreur génération EAN.");
        }
    }
}
