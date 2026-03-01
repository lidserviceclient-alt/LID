package com.lifeevent.lid.backoffice.setting.controller;

import com.lifeevent.lid.backoffice.setting.dto.BackOfficeSettingShippingMethodDto;
import com.lifeevent.lid.backoffice.setting.service.BackOfficeSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/backoffice/shipping-methods", "/api/backoffice/shipping-methods"})
@RequiredArgsConstructor
public class BackOfficeShippingMethodsController {

    private final BackOfficeSettingService backOfficeSettingService;

    @GetMapping
    public ResponseEntity<List<BackOfficeSettingShippingMethodDto>> list() {
        return ResponseEntity.ok(backOfficeSettingService.getShippingMethods());
    }

    @PostMapping
    public ResponseEntity<BackOfficeSettingShippingMethodDto> create(@RequestBody BackOfficeSettingShippingMethodDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeSettingService.createShippingMethod(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BackOfficeSettingShippingMethodDto> update(@PathVariable String id, @RequestBody BackOfficeSettingShippingMethodDto dto) {
        return ResponseEntity.ok(backOfficeSettingService.updateShippingMethod(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        backOfficeSettingService.deleteShippingMethod(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/enable")
    public ResponseEntity<BackOfficeSettingShippingMethodDto> enable(@PathVariable String id) {
        return ResponseEntity.ok(backOfficeSettingService.enableShippingMethod(id));
    }

    @PostMapping("/{id}/disable")
    public ResponseEntity<BackOfficeSettingShippingMethodDto> disable(@PathVariable String id) {
        return ResponseEntity.ok(backOfficeSettingService.disableShippingMethod(id));
    }

    @PostMapping("/{id}/default")
    public ResponseEntity<BackOfficeSettingShippingMethodDto> setDefault(@PathVariable String id) {
        return ResponseEntity.ok(backOfficeSettingService.setDefaultShippingMethod(id));
    }
}
