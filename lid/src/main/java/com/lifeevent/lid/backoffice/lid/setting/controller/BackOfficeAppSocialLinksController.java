package com.lifeevent.lid.backoffice.lid.setting.controller;

import com.lifeevent.lid.backoffice.lid.setting.dto.BackOfficeSettingSocialLinkDto;
import com.lifeevent.lid.backoffice.lid.setting.service.BackOfficeSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/backoffice/app-config/social-links", "/api/backoffice/app-config/social-links"})
@RequiredArgsConstructor
public class BackOfficeAppSocialLinksController {

    private final BackOfficeSettingService backOfficeSettingService;

    @GetMapping
    public ResponseEntity<List<BackOfficeSettingSocialLinkDto>> list() {
        return ResponseEntity.ok(backOfficeSettingService.getSocialLinks());
    }

    @PostMapping
    public ResponseEntity<BackOfficeSettingSocialLinkDto> create(@RequestBody BackOfficeSettingSocialLinkDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeSettingService.createSocialLink(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BackOfficeSettingSocialLinkDto> update(@PathVariable String id, @RequestBody BackOfficeSettingSocialLinkDto dto) {
        return ResponseEntity.ok(backOfficeSettingService.updateSocialLink(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        backOfficeSettingService.deleteSocialLink(id);
        return ResponseEntity.noContent().build();
    }
}
