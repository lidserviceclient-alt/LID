package com.lifeevent.lid.payment.config;

// import com.paydunya.neptune.PaydunyaSetup;
// import com.paydunya.neptune.PaydunyaCheckoutStore;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration PayDunya pour l'intégration des paiements.
 * Gère les clés API et les modes de paiement (test/production)
 */
@Configuration
@EnableConfigurationProperties(PaydunyaProperties.class)
// @ConditionalOnClass(name = "com.paydunya.neptune.PaydunyaSetup")
public class PaydunyaConfig {

    // @Bean
    // public PaydunyaSetup paydunyaSetup(PaydunyaProperties properties) {
    //     PaydunyaSetup setup = new PaydunyaSetup();
    //     setup.setMasterKey(properties.getMasterKey());
    //     setup.setPrivateKey(properties.getPrivateKey());
    //     setup.setPublicKey(properties.getPublicKey());
    //     setup.setToken(properties.getToken());
    //     setup.setMode(properties.getMode()); // "test" ou "live"
    //     return setup;
    // }

    // @Bean
    // public PaydunyaCheckoutStore paydunyaStore(PaydunyaProperties properties) {
    //     PaydunyaCheckoutStore store = new PaydunyaCheckoutStore();
    //     store.setName(properties.getStoreName());
    //     store.setTagline(properties.getStoreTagline());
    //     store.setPhoneNumber(properties.getStorePhoneNumber());
    //     store.setPostalAddress(properties.getStorePostalAddress());
    //     store.setWebsiteUrl(properties.getStoreWebsiteUrl());
    //     store.setLogoUrl(properties.getStoreLogoUrl());
    //     store.setCallbackUrl(properties.getCallbackUrl());
    //     store.setCancelUrl(properties.getCancelUrl());
    //     return store;
    // }

    @Bean
    RestTemplate paydunyaRestTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }
}
