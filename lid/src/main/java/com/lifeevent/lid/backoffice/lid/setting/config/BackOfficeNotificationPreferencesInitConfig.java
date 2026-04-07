package com.lifeevent.lid.backoffice.lid.setting.config;

import com.lifeevent.lid.backoffice.lid.setting.entity.BackOfficeNotificationPreferenceEntity;
import com.lifeevent.lid.backoffice.lid.setting.repository.BackOfficeNotificationPreferenceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
public class BackOfficeNotificationPreferencesInitConfig {

    public static Map<String, String> supported() {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("STOCK_ALERTS", "Alertes stock");
        m.put("LOW_STOCK", "Stock faible");
        m.put("PAYMENT_FAILED", "Paiements échoués");
        m.put("NEW_ORDER", "Nouvelles commandes");
        m.put("RETURN_REQUEST", "Demandes de retour");
        m.put("NEW_CUSTOMER", "Nouveaux clients");
        m.put("NEW_CONTACT", "Nouveaux messages contact");
        m.put("DELIVERY_ANOMALY", "Anomalies logistiques");
        m.put("NEW_PARTNER_UNDER_REVIEW", "Partenaires à valider");
        m.put("NEW_TICKET", "Nouveaux tickets support");
        m.put("SECURITY_LOGIN", "Connexions admin");
        m.put("PROMO_EXPIRING", "Promos qui expirent");
        return m;
    }

    @Bean
    CommandLineRunner initBackOfficeNotificationPreferences(
            BackOfficeNotificationPreferenceRepository notificationPreferenceRepository
    ) {
        return args -> {
            for (Map.Entry<String, String> entry : supported().entrySet()) {
                String key = entry.getKey();
                if (notificationPreferenceRepository.existsById(key)) {
                    continue;
                }

                notificationPreferenceRepository.save(
                        BackOfficeNotificationPreferenceEntity.builder()
                                .key(key)
                                .label(entry.getValue())
                                .enabled(Boolean.TRUE)
                                .build()
                );
            }
        };
    }

}
