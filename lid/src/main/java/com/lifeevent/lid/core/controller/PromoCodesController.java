package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.PromoCodeDto;
import com.lifeevent.lid.core.dto.PromoCodeStatsDto;
import com.lifeevent.lid.core.dto.UpsertPromoCodeRequest;
import com.lifeevent.lid.core.service.PromoCodeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/backoffice/promo-codes")
public class PromoCodesController {

    private final PromoCodeService promoCodeService;

    public PromoCodesController(PromoCodeService promoCodeService) {
        this.promoCodeService = promoCodeService;
    }

    @GetMapping
    public List<PromoCodeDto> listPromoCodes() {
        return promoCodeService.listAll();
    }

    @GetMapping("/{id}")
    public PromoCodeDto getPromoCode(@PathVariable String id) {
        return promoCodeService.getById(id);
    }

    @GetMapping("/stats")
    public PromoCodeStatsDto promoStats(@RequestParam(name = "days", required = false) Integer days) {
        return promoCodeService.getStats(days);
    }

    @PostMapping
    public PromoCodeDto createPromoCode(@Valid @RequestBody UpsertPromoCodeRequest request) {
        return promoCodeService.create(request);
    }

    @PutMapping("/{id}")
    public PromoCodeDto updatePromoCode(
            @PathVariable String id,
            @Valid @RequestBody UpsertPromoCodeRequest request
    ) {
        return promoCodeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void deletePromoCode(@PathVariable String id) {
        promoCodeService.delete(id);
    }
}

