package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.AppConfigDto;
import com.lifeevent.lid.core.dto.UpdateAppConfigRequest;
import com.lifeevent.lid.core.service.AppConfigService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/backoffice/app-config")
public class BackofficeAppConfigController {

    private final AppConfigService service;

    public BackofficeAppConfigController(AppConfigService service) {
        this.service = service;
    }

    @GetMapping
    public AppConfigDto get() {
        return service.getBackoffice();
    }

    @PutMapping
    public AppConfigDto update(@Valid @RequestBody UpdateAppConfigRequest request) {
        return service.update(request);
    }
}

