package com.lifeevent.lid.payment.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Propriétés de configuration pour PayDunya.
 * À configurer dans application.yaml
 */
@Data
@ConfigurationProperties(prefix = "paydunya")
public class PaydunyaProperties {

    private static final int DEFAULT_DISBURSEMENT_CONNECT_TIMEOUT_MS = 5000;
    private static final int DEFAULT_DISBURSEMENT_READ_TIMEOUT_MS = 15000;
    private static final int DEFAULT_DISBURSEMENT_RETRY_MAX_ATTEMPTS = 3;
    private static final long DEFAULT_DISBURSEMENT_RETRY_INITIAL_DELAY_MS = 500L;
    
    // API Keys
    private String masterKey;
    private String privateKey;
    private String publicKey;
    private String token;
    
    // Mode: "test" ou "live"
    private String mode = "test";
    
    // Store Configuration
    private String storeName;
    private String storeTagline;
    private String storePhoneNumber;
    private String storePostalAddress;
    private String storeWebsiteUrl;
    private String storeLogoUrl;
    
    // URLs de redirection
    private String callbackUrl;
    private String cancelUrl;
    private String returnUrl;
    private String disbursementCallbackUrl;
    private String apiBaseUrl;
    private int disbursementConnectTimeoutMs = DEFAULT_DISBURSEMENT_CONNECT_TIMEOUT_MS;
    private int disbursementReadTimeoutMs = DEFAULT_DISBURSEMENT_READ_TIMEOUT_MS;
    private int disbursementRetryMaxAttempts = DEFAULT_DISBURSEMENT_RETRY_MAX_ATTEMPTS;
    private long disbursementRetryInitialDelayMs = DEFAULT_DISBURSEMENT_RETRY_INITIAL_DELAY_MS;
    
    // Pays supportés (liste des opérateurs)
    private String supportedCountries = "CI,SN,BJ,BF,CM,CG,GA,GW,ML"; // Côte d'Ivoire par défaut + autres pays africains
}
