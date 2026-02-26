package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.IntegrationsConfigDto;
import com.lifeevent.lid.core.dto.UpdateIntegrationsConfigRequest;
import com.lifeevent.lid.core.entity.IntegrationConfig;
import com.lifeevent.lid.core.repository.IntegrationConfigRepository;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class IntegrationConfigService {

    private static final String DEFAULT_ID = "default";

    private final IntegrationConfigRepository repository;
    private final RestTemplate restTemplate;

    public IntegrationConfigService(IntegrationConfigRepository repository, RestTemplateBuilder restTemplateBuilder) {
        this.repository = repository;
        this.restTemplate = restTemplateBuilder.build();
    }

    @Transactional
    public IntegrationsConfigDto get() {
        IntegrationConfig cfg = getOrCreate();
        return toDto(cfg);
    }

    @Transactional
    public IntegrationsConfigDto update(UpdateIntegrationsConfigRequest request) {
        IntegrationConfig cfg = getOrCreate();
        boolean changed = false;
        boolean slackUrlChanged = false;
        String slackUrlCandidate = null;

        if (Boolean.TRUE.equals(request.paydunyaDisconnect())) {
            cfg.setPaydunyaMode(null);
            cfg.setPaydunyaPublicKey(null);
            cfg.setPaydunyaPrivateKey(null);
            cfg.setPaydunyaMasterKey(null);
            cfg.setPaydunyaToken(null);
            changed = true;
        } else {
            if (hasText(request.paydunyaMode())) {
                String mode = request.paydunyaMode().trim().toLowerCase();
                if (!"test".equals(mode) && !"live".equals(mode)) {
                    throw new IllegalArgumentException("Mode Paydunya invalide (test/live).");
                }
                cfg.setPaydunyaMode(mode);
                changed = true;
            }
            if (hasText(request.paydunyaPublicKey())) {
                cfg.setPaydunyaPublicKey(request.paydunyaPublicKey().trim());
                changed = true;
            }
            if (hasText(request.paydunyaPrivateKey())) {
                cfg.setPaydunyaPrivateKey(request.paydunyaPrivateKey().trim());
                changed = true;
            }
            if (hasText(request.paydunyaMasterKey())) {
                cfg.setPaydunyaMasterKey(request.paydunyaMasterKey().trim());
                changed = true;
            }
            if (hasText(request.paydunyaToken())) {
                cfg.setPaydunyaToken(request.paydunyaToken().trim());
                changed = true;
            }
        }

        if (Boolean.TRUE.equals(request.sendinblueDisconnect())) {
            cfg.setSendinblueApiKey(null);
            changed = true;
        } else if (hasText(request.sendinblueApiKey())) {
            String key = request.sendinblueApiKey().trim();
            if (key.length() < 20) {
                throw new IllegalArgumentException("Clé Sendinblue invalide.");
            }
            cfg.setSendinblueApiKey(key);
            changed = true;
        }

        if (Boolean.TRUE.equals(request.slackDisconnect())) {
            cfg.setSlackWebhookUrl(null);
            changed = true;
        } else if (hasText(request.slackWebhookUrl())) {
            String url = request.slackWebhookUrl().trim();
            if (!url.startsWith("https://hooks.slack.com/")) {
                throw new IllegalArgumentException("Webhook Slack invalide.");
            }
            String previous = cfg.getSlackWebhookUrl();
            if (!url.equals(previous)) {
                slackUrlChanged = true;
                slackUrlCandidate = url;
            }
            cfg.setSlackWebhookUrl(url);
            changed = true;
        }

        if (Boolean.TRUE.equals(request.googleAnalyticsDisconnect())) {
            cfg.setGoogleAnalyticsMeasurementId(null);
            changed = true;
        } else if (hasText(request.googleAnalyticsMeasurementId())) {
            String id = request.googleAnalyticsMeasurementId().trim();
            if (!(id.startsWith("G-") || id.startsWith("UA-"))) {
                throw new IllegalArgumentException("Measurement ID Google Analytics invalide.");
            }
            cfg.setGoogleAnalyticsMeasurementId(id);
            changed = true;
        }

        if (slackUrlChanged && slackUrlCandidate != null) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(Map.of("text", "LID Backoffice: Slack connecté."), headers);
            restTemplate.postForEntity(slackUrlCandidate, entity, String.class);
        }

        if (changed) {
            cfg.setUpdatedAt(LocalDateTime.now());
            cfg = repository.save(cfg);
        }

        return toDto(cfg);
    }

    private IntegrationConfig getOrCreate() {
        return repository.findById(DEFAULT_ID).orElseGet(() -> {
            IntegrationConfig cfg = new IntegrationConfig();
            cfg.setId(DEFAULT_ID);
            cfg.setPaydunyaMode("test");
            cfg.setUpdatedAt(LocalDateTime.now());
            return repository.save(cfg);
        });
    }

    private static IntegrationsConfigDto toDto(IntegrationConfig cfg) {
        boolean paydunyaConnected =
                hasText(cfg.getPaydunyaMasterKey()) &&
                hasText(cfg.getPaydunyaPrivateKey()) &&
                hasText(cfg.getPaydunyaToken());

        return new IntegrationsConfigDto(
                paydunyaConnected,
                cfg.getPaydunyaMode(),
                cfg.getPaydunyaPublicKey(),
                hasText(cfg.getSendinblueApiKey()),
                hasText(cfg.getSlackWebhookUrl()),
                hasText(cfg.getGoogleAnalyticsMeasurementId()),
                cfg.getGoogleAnalyticsMeasurementId(),
                cfg.getUpdatedAt()
        );
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
