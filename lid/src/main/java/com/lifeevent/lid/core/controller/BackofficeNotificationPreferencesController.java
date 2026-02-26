package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.NotificationPreferenceDto;
import com.lifeevent.lid.core.dto.UpdateNotificationPreferencesRequest;
import com.lifeevent.lid.core.service.NotificationPreferenceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/backoffice/notification-preferences")
public class BackofficeNotificationPreferencesController {

    private final NotificationPreferenceService service;

    public BackofficeNotificationPreferencesController(NotificationPreferenceService service) {
        this.service = service;
    }

    @GetMapping
    public List<NotificationPreferenceDto> list() {
        return service.list();
    }

    @PutMapping
    public List<NotificationPreferenceDto> update(@RequestBody UpdateNotificationPreferencesRequest request) {
        return service.update(request);
    }
}

