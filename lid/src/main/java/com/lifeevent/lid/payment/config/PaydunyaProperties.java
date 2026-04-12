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
    private String apiBaseUrl = "https://app.paydunya.com";
    
    // Pays supportés (liste des opérateurs)
    private String supportedCountries = "CI,SN,BJ,BF,CM,CG,GA,GW,ML"; // Côte d'Ivoire par défaut + autres pays africains
}
