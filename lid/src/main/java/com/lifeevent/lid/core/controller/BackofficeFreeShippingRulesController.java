package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.CreateFreeShippingRuleRequest;
import com.lifeevent.lid.core.dto.FreeShippingRuleDto;
import com.lifeevent.lid.core.dto.UpdateFreeShippingRuleRequest;
import com.lifeevent.lid.core.service.FreeShippingRuleService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/backoffice/free-shipping-rules")
public class BackofficeFreeShippingRulesController {

    private final FreeShippingRuleService service;

    public BackofficeFreeShippingRulesController(FreeShippingRuleService service) {
        this.service = service;
    }

    @GetMapping
    public List<FreeShippingRuleDto> list() {
        return service.list();
    }

    @PostMapping
    public FreeShippingRuleDto create(@Valid @RequestBody CreateFreeShippingRuleRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public FreeShippingRuleDto update(@PathVariable String id, @Valid @RequestBody UpdateFreeShippingRuleRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

    @PostMapping("/{id}/enable")
    public FreeShippingRuleDto enable(@PathVariable String id) {
        return service.enable(id);
    }

    @PostMapping("/{id}/disable")
    public FreeShippingRuleDto disable(@PathVariable String id) {
        return service.disable(id);
    }
}

