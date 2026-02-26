package com.lifeevent.lid.core.service;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.core.dto.CreateShippingMethodRequest;
import com.lifeevent.lid.core.dto.ShippingMethodDto;
import com.lifeevent.lid.core.dto.UpdateShippingMethodRequest;
import com.lifeevent.lid.core.entity.AppConfig;
import com.lifeevent.lid.core.entity.ShippingMethod;
import com.lifeevent.lid.core.repository.AppConfigRepository;
import com.lifeevent.lid.core.repository.ShippingMethodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShippingMethodService {

    private static final String DEFAULT_ID = "default";

    private final AppConfigRepository appConfigRepository;
    private final ShippingMethodRepository repository;

    public ShippingMethodService(AppConfigRepository appConfigRepository, ShippingMethodRepository repository) {
        this.appConfigRepository = appConfigRepository;
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ShippingMethodDto> list() {
        return repository.findByAppConfigIdOrderBySortOrderAscUpdatedAtDesc(DEFAULT_ID).stream().map(ShippingMethodService::toDto).toList();
    }

    @Transactional
    public ShippingMethodDto create(CreateShippingMethodRequest request) {
        AppConfig cfg = appConfigRepository.findById(DEFAULT_ID)
                .orElseThrow(() -> new ResourceNotFoundException("AppConfig", "id", DEFAULT_ID));

        ShippingMethod sm = new ShippingMethod();
        sm.setAppConfig(cfg);
        sm.setCode(request.code().trim().toUpperCase());
        sm.setLabel(request.label().trim());
        sm.setDescription(normalizeText(request.description()));
        sm.setCostAmount(request.costAmount());
        sm.setEnabled(request.enabled() == null ? Boolean.TRUE : Boolean.TRUE.equals(request.enabled()));
        sm.setIsDefault(Boolean.TRUE.equals(request.isDefault()));
        sm.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
        sm.setUpdatedAt(LocalDateTime.now());
        sm = repository.save(sm);

        if (Boolean.TRUE.equals(sm.getIsDefault())) {
            setDefaultInternal(sm.getId(), true);
        }

        return toDto(sm);
    }

    @Transactional
    public ShippingMethodDto update(String id, UpdateShippingMethodRequest request) {
        ShippingMethod sm = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShippingMethod", "id", id));

        sm.setCode(request.code().trim().toUpperCase());
        sm.setLabel(request.label().trim());
        sm.setDescription(normalizeText(request.description()));
        sm.setCostAmount(request.costAmount());
        sm.setEnabled(request.enabled() == null ? sm.getEnabled() : Boolean.TRUE.equals(request.enabled()));
        sm.setIsDefault(Boolean.TRUE.equals(request.isDefault()));
        sm.setSortOrder(request.sortOrder() == null ? sm.getSortOrder() : request.sortOrder());
        sm.setUpdatedAt(LocalDateTime.now());
        sm = repository.save(sm);

        if (Boolean.TRUE.equals(sm.getIsDefault())) {
            setDefaultInternal(sm.getId(), true);
        }

        return toDto(sm);
    }

    @Transactional
    public void delete(String id) {
        ShippingMethod sm = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShippingMethod", "id", id));
        repository.delete(sm);
    }

    @Transactional
    public ShippingMethodDto enable(String id) {
        ShippingMethod sm = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShippingMethod", "id", id));
        sm.setEnabled(Boolean.TRUE);
        sm.setUpdatedAt(LocalDateTime.now());
        sm = repository.save(sm);
        return toDto(sm);
    }

    @Transactional
    public ShippingMethodDto disable(String id) {
        ShippingMethod sm = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShippingMethod", "id", id));
        sm.setEnabled(Boolean.FALSE);
        sm.setIsDefault(Boolean.FALSE);
        sm.setUpdatedAt(LocalDateTime.now());
        sm = repository.save(sm);
        return toDto(sm);
    }

    @Transactional
    public ShippingMethodDto setDefault(String id) {
        return setDefaultInternal(id, true);
    }

    private ShippingMethodDto setDefaultInternal(String id, boolean enableIfNeeded) {
        ShippingMethod sm = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShippingMethod", "id", id));

        if (enableIfNeeded && !Boolean.TRUE.equals(sm.getEnabled())) {
            sm.setEnabled(Boolean.TRUE);
        }

        sm.setIsDefault(Boolean.TRUE);
        sm.setUpdatedAt(LocalDateTime.now());
        sm = repository.save(sm);

        List<ShippingMethod> all = repository.findByAppConfigIdOrderBySortOrderAscUpdatedAtDesc(DEFAULT_ID);
        for (ShippingMethod other : all) {
            if (other == null || other.getId() == null) continue;
            if (other.getId().equals(sm.getId())) continue;
            if (!Boolean.TRUE.equals(other.getIsDefault())) continue;
            other.setIsDefault(Boolean.FALSE);
            other.setUpdatedAt(LocalDateTime.now());
            repository.save(other);
        }

        return toDto(sm);
    }

    private static String normalizeText(String value) {
        if (value == null) return null;
        String v = value.trim();
        return v.isEmpty() ? null : v;
    }

    private static ShippingMethodDto toDto(ShippingMethod sm) {
        return new ShippingMethodDto(
                sm.getId(),
                sm.getCode(),
                sm.getLabel(),
                sm.getDescription(),
                sm.getCostAmount(),
                Boolean.TRUE.equals(sm.getEnabled()),
                Boolean.TRUE.equals(sm.getIsDefault()),
                sm.getSortOrder(),
                sm.getUpdatedAt()
        );
    }
}
