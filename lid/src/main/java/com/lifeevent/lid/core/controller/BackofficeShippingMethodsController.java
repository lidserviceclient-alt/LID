package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.CreateShippingMethodRequest;
import com.lifeevent.lid.core.dto.ShippingMethodDto;
import com.lifeevent.lid.core.dto.UpdateShippingMethodRequest;
import com.lifeevent.lid.core.service.ShippingMethodService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/backoffice/shipping-methods")
public class BackofficeShippingMethodsController {

    private final ShippingMethodService service;

    public BackofficeShippingMethodsController(ShippingMethodService service) {
        this.service = service;
    }

    @GetMapping
    public List<ShippingMethodDto> list() {
        return service.list();
    }

    @PostMapping
    public ShippingMethodDto create(@Valid @RequestBody CreateShippingMethodRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public ShippingMethodDto update(@PathVariable String id, @Valid @RequestBody UpdateShippingMethodRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

    @PostMapping("/{id}/enable")
    public ShippingMethodDto enable(@PathVariable String id) {
        return service.enable(id);
    }

    @PostMapping("/{id}/disable")
    public ShippingMethodDto disable(@PathVariable String id) {
        return service.disable(id);
    }

    @PostMapping("/{id}/default")
    public ShippingMethodDto setDefault(@PathVariable String id) {
        return service.setDefault(id);
    }
}

