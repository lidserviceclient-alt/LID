package com.lifeevent.lid.core.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class BackofficeSecuritySettingsService {

    private final AtomicBoolean admin2faEnabled = new AtomicBoolean(true);

    public boolean isAdmin2faEnabled() {
        return admin2faEnabled.get();
    }

    public void setAdmin2faEnabled(boolean enabled) {
        admin2faEnabled.set(enabled);
    }
}
