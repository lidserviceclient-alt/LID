package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.SocialLinkDto;
import com.lifeevent.lid.core.dto.UpsertSocialLinkRequest;
import com.lifeevent.lid.core.entity.AppConfig;
import com.lifeevent.lid.core.entity.AppSocialLink;
import com.lifeevent.lid.core.enums.SocialPlatform;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.core.repository.AppConfigRepository;
import com.lifeevent.lid.core.repository.AppSocialLinkRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppSocialLinkService {

    private static final String DEFAULT_ID = "default";

    private final AppConfigRepository appConfigRepository;
    private final AppSocialLinkRepository repository;

    public AppSocialLinkService(AppConfigRepository appConfigRepository, AppSocialLinkRepository repository) {
        this.appConfigRepository = appConfigRepository;
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<SocialLinkDto> list() {
        return repository.findByAppConfigId(DEFAULT_ID).stream().map(AppSocialLinkService::toDto).toList();
    }

    @Transactional
    public SocialLinkDto create(UpsertSocialLinkRequest request) {
        AppConfig cfg = appConfigRepository.findById(DEFAULT_ID)
                .orElseThrow(() -> new ResourceNotFoundException("AppConfig", "id", DEFAULT_ID));
        AppSocialLink link = new AppSocialLink();
        link.setAppConfig(cfg);
        link.setPlatform(SocialPlatform.valueOf(request.platform().trim().toUpperCase()));
        link.setUrl(request.url().trim());
        link.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
        link.setUpdatedAt(LocalDateTime.now());
        link = repository.save(link);
        return toDto(link);
    }

    @Transactional
    public SocialLinkDto update(String id, UpsertSocialLinkRequest request) {
        AppSocialLink link = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AppSocialLink", "id", id));
        link.setPlatform(SocialPlatform.valueOf(request.platform().trim().toUpperCase()));
        link.setUrl(request.url().trim());
        link.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
        link.setUpdatedAt(LocalDateTime.now());
        link = repository.save(link);
        return toDto(link);
    }

    @Transactional
    public void delete(String id) {
        AppSocialLink link = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AppSocialLink", "id", id));
        repository.delete(link);
    }

    private static SocialLinkDto toDto(AppSocialLink link) {
        return new SocialLinkDto(
                link.getId(),
                link.getPlatform() == null ? null : link.getPlatform().name(),
                link.getUrl(),
                link.getSortOrder()
        );
    }
}
