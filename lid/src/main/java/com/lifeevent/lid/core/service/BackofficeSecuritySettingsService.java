package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.entity.BackofficeSecuritySettings;
import com.lifeevent.lid.core.repository.BackofficeSecuritySettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BackofficeSecuritySettingsService {

    private static final String SETTINGS_ID = "BACKOFFICE";

    private final BackofficeSecuritySettingsRepository repository;

    public BackofficeSecuritySettingsService(BackofficeSecuritySettingsRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public boolean isAdmin2faEnabled() {
        return repository.findById(SETTINGS_ID)
                .map((s) -> Boolean.TRUE.equals(s.getAdmin2faEnabled()))
                .orElse(true);
    }

    @Transactional
    public void setAdmin2faEnabled(boolean enabled) {
        BackofficeSecuritySettings settings = repository.findById(SETTINGS_ID).orElseGet(() -> {
            BackofficeSecuritySettings s = new BackofficeSecuritySettings();
            s.setId(SETTINGS_ID);
            s.setAdmin2faEnabled(Boolean.TRUE);
            return s;
        });
        settings.setAdmin2faEnabled(enabled);
        repository.save(settings);
    }
}
