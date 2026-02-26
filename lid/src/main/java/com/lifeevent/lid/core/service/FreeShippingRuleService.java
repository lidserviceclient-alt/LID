package com.lifeevent.lid.core.service;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.core.dto.CreateFreeShippingRuleRequest;
import com.lifeevent.lid.core.dto.FreeShippingRuleDto;
import com.lifeevent.lid.core.dto.UpdateFreeShippingRuleRequest;
import com.lifeevent.lid.core.entity.AppConfig;
import com.lifeevent.lid.core.entity.FreeShippingRule;
import com.lifeevent.lid.core.repository.AppConfigRepository;
import com.lifeevent.lid.core.repository.FreeShippingRuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FreeShippingRuleService {

    private static final String DEFAULT_ID = "default";

    private final AppConfigRepository appConfigRepository;
    private final FreeShippingRuleRepository repository;

    public FreeShippingRuleService(AppConfigRepository appConfigRepository, FreeShippingRuleRepository repository) {
        this.appConfigRepository = appConfigRepository;
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<FreeShippingRuleDto> list() {
        return repository.findByAppConfigIdOrderByUpdatedAtDesc(DEFAULT_ID).stream().map(FreeShippingRuleService::toDto).toList();
    }

    @Transactional
    public FreeShippingRuleDto create(CreateFreeShippingRuleRequest request) {
        AppConfig cfg = appConfigRepository.findById(DEFAULT_ID)
                .orElseThrow(() -> new ResourceNotFoundException("AppConfig", "id", DEFAULT_ID));

        FreeShippingRule rule = new FreeShippingRule();
        rule.setAppConfig(cfg);
        rule.setThresholdAmount(request.thresholdAmount());
        rule.setProgressMessageTemplate(normalizeMessage(request.progressMessageTemplate()));
        rule.setUnlockedMessage(normalizeMessage(request.unlockedMessage()));
        rule.setEnabled(Boolean.TRUE.equals(request.enabled()));
        rule.setUpdatedAt(LocalDateTime.now());
        rule = repository.save(rule);

        if (Boolean.TRUE.equals(rule.getEnabled())) {
            disableOthers(rule.getId());
        }

        return toDto(rule);
    }

    @Transactional
    public FreeShippingRuleDto update(String id, UpdateFreeShippingRuleRequest request) {
        FreeShippingRule rule = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FreeShippingRule", "id", id));

        rule.setThresholdAmount(request.thresholdAmount());
        rule.setProgressMessageTemplate(normalizeMessage(request.progressMessageTemplate()));
        rule.setUnlockedMessage(normalizeMessage(request.unlockedMessage()));
        rule.setEnabled(Boolean.TRUE.equals(request.enabled()));
        rule.setUpdatedAt(LocalDateTime.now());
        rule = repository.save(rule);

        if (Boolean.TRUE.equals(rule.getEnabled())) {
            disableOthers(rule.getId());
        }

        return toDto(rule);
    }

    @Transactional
    public void delete(String id) {
        FreeShippingRule rule = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FreeShippingRule", "id", id));
        repository.delete(rule);
    }

    @Transactional
    public FreeShippingRuleDto enable(String id) {
        FreeShippingRule rule = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FreeShippingRule", "id", id));
        rule.setEnabled(Boolean.TRUE);
        rule.setUpdatedAt(LocalDateTime.now());
        rule = repository.save(rule);
        disableOthers(rule.getId());
        return toDto(rule);
    }

    @Transactional
    public FreeShippingRuleDto disable(String id) {
        FreeShippingRule rule = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FreeShippingRule", "id", id));
        rule.setEnabled(Boolean.FALSE);
        rule.setUpdatedAt(LocalDateTime.now());
        rule = repository.save(rule);
        return toDto(rule);
    }

    private void disableOthers(String keepId) {
        List<FreeShippingRule> all = repository.findByAppConfigIdOrderByUpdatedAtDesc(DEFAULT_ID);
        for (FreeShippingRule other : all) {
            if (other == null) continue;
            if (other.getId() == null) continue;
            if (other.getId().equals(keepId)) continue;
            if (!Boolean.TRUE.equals(other.getEnabled())) continue;
            other.setEnabled(Boolean.FALSE);
            other.setUpdatedAt(LocalDateTime.now());
            repository.save(other);
        }
    }

    private static String normalizeMessage(String value) {
        if (value == null) return null;
        String v = value.trim();
        return v.isEmpty() ? null : v;
    }

    private static FreeShippingRuleDto toDto(FreeShippingRule rule) {
        return new FreeShippingRuleDto(
                rule.getId(),
                Boolean.TRUE.equals(rule.getEnabled()),
                rule.getThresholdAmount(),
                rule.getProgressMessageTemplate(),
                rule.getUnlockedMessage(),
                rule.getUpdatedAt()
        );
    }
}

