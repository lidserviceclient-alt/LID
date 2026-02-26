package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.SocialLinkDto;
import com.lifeevent.lid.core.dto.UpsertSocialLinkRequest;
import com.lifeevent.lid.core.service.AppSocialLinkService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/backoffice/app-config/social-links")
public class BackofficeAppSocialLinksController {

    private final AppSocialLinkService service;

    public BackofficeAppSocialLinksController(AppSocialLinkService service) {
        this.service = service;
    }

    @GetMapping
    public List<SocialLinkDto> list() {
        return service.list();
    }

    @PostMapping
    public SocialLinkDto create(@Valid @RequestBody UpsertSocialLinkRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public SocialLinkDto update(@PathVariable String id, @Valid @RequestBody UpsertSocialLinkRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}

