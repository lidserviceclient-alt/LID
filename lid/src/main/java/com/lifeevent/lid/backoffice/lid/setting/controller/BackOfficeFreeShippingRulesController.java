package com.lifeevent.lid.backoffice.lid.setting.controller;

import com.lifeevent.lid.backoffice.lid.setting.dto.BackOfficeSettingFreeShippingRuleDto;
import com.lifeevent.lid.backoffice.lid.setting.service.BackOfficeSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/backoffice/free-shipping-rules", "/api/backoffice/free-shipping-rules"})
@RequiredArgsConstructor
public class BackOfficeFreeShippingRulesController {

    private final BackOfficeSettingService backOfficeSettingService;

    @GetMapping
    public ResponseEntity<List<BackOfficeSettingFreeShippingRuleDto>> list() {
        return ResponseEntity.ok(backOfficeSettingService.getFreeShippingRules());
    }

    @PostMapping
    public ResponseEntity<BackOfficeSettingFreeShippingRuleDto> create(@RequestBody BackOfficeSettingFreeShippingRuleDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeSettingService.createFreeShippingRule(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BackOfficeSettingFreeShippingRuleDto> update(@PathVariable String id, @RequestBody BackOfficeSettingFreeShippingRuleDto dto) {
        return ResponseEntity.ok(backOfficeSettingService.updateFreeShippingRule(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        backOfficeSettingService.deleteFreeShippingRule(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/enable")
    public ResponseEntity<BackOfficeSettingFreeShippingRuleDto> enable(@PathVariable String id) {
        return ResponseEntity.ok(backOfficeSettingService.enableFreeShippingRule(id));
    }

    @PostMapping("/{id}/disable")
    public ResponseEntity<BackOfficeSettingFreeShippingRuleDto> disable(@PathVariable String id) {
        return ResponseEntity.ok(backOfficeSettingService.disableFreeShippingRule(id));
    }
}
