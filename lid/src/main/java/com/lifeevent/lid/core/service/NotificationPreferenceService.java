package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.NotificationPreferenceDto;
import com.lifeevent.lid.core.dto.NotificationPreferenceUpdate;
import com.lifeevent.lid.core.dto.UpdateNotificationPreferencesRequest;
import com.lifeevent.lid.core.entity.NotificationPreference;
import com.lifeevent.lid.core.repository.NotificationPreferenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository repository;

    public NotificationPreferenceService(NotificationPreferenceRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public List<NotificationPreferenceDto> list() {
        Map<String, String> supported = supported();
        for (String key : supported.keySet()) {
            if (repository.existsById(key)) continue;
            NotificationPreference p = new NotificationPreference();
            p.setKey(key);
            p.setEnabled(true);
            p.setUpdatedAt(LocalDateTime.now());
            repository.save(p);
        }
        return supported.entrySet().stream()
                .map((e) -> {
                    NotificationPreference p = repository.findById(e.getKey()).orElse(null);
                    boolean enabled = p == null ? true : Boolean.TRUE.equals(p.getEnabled());
                    return new NotificationPreferenceDto(e.getKey(), e.getValue(), enabled);
                })
                .toList();
    }

    @Transactional
    public List<NotificationPreferenceDto> update(UpdateNotificationPreferencesRequest request) {
        List<NotificationPreferenceUpdate> items = request == null ? null : request.items();
        Map<String, String> supported = supported();

        if (items != null) {
            for (NotificationPreferenceUpdate it : items) {
                if (it == null) continue;
                String key = it.key();
                if (key == null || key.trim().isEmpty()) continue;
                if (!supported.containsKey(key)) continue;
                NotificationPreference p = repository.findById(key).orElseGet(() -> {
                    NotificationPreference created = new NotificationPreference();
                    created.setKey(key);
                    created.setEnabled(true);
                    created.setUpdatedAt(LocalDateTime.now());
                    return created;
                });
                p.setEnabled(it.enabled());
                p.setUpdatedAt(LocalDateTime.now());
                repository.save(p);
            }
        }

        return list();
    }

    private static Map<String, String> supported() {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("STOCK_ALERTS", "Alertes stock");
        m.put("LOW_STOCK", "Stock faible");
        m.put("PAYMENT_FAILED", "Paiements échoués");
        m.put("NEW_ORDER", "Nouvelles commandes");
        m.put("RETURN_REQUEST", "Demandes de retour");
        m.put("NEW_CUSTOMER", "Nouveaux clients");
        m.put("NEW_CONTACT", "Nouveaux messages contact");
        m.put("DELIVERY_ANOMALY", "Anomalies logistiques");
        m.put("NEW_TICKET", "Nouveaux tickets support");
        m.put("SECURITY_LOGIN", "Connexions admin");
        m.put("PROMO_EXPIRING", "Promos qui expirent");
        return m;
    }
}

