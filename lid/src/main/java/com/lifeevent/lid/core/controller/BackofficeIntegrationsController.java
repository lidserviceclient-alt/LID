package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.IntegrationsConfigDto;
import com.lifeevent.lid.core.dto.UpdateIntegrationsConfigRequest;
import com.lifeevent.lid.core.service.IntegrationConfigService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/backoffice/integrations")
public class BackofficeIntegrationsController {

    private final IntegrationConfigService service;

    public BackofficeIntegrationsController(IntegrationConfigService service) {
        this.service = service;
    }

    @GetMapping
    public IntegrationsConfigDto get() {
        return service.get();
    }

    @PutMapping
    public IntegrationsConfigDto update(@RequestBody UpdateIntegrationsConfigRequest request) {
        return service.update(request);
    }
}

