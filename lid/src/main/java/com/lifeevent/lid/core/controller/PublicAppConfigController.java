package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.AppConfigDto;
import com.lifeevent.lid.core.service.AppConfigService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/app-config")
public class PublicAppConfigController {

    private final AppConfigService service;

    public PublicAppConfigController(AppConfigService service) {
        this.service = service;
    }

    @GetMapping
    public AppConfigDto get() {
        return service.getPublic();
    }
}

