package com.lifeevent.lid.backoffice.promo.controller;

import com.lifeevent.lid.backoffice.promo.dto.BackOfficePromoCodeDto;
import com.lifeevent.lid.backoffice.promo.dto.PromoCodeStatsDto;
import com.lifeevent.lid.backoffice.promo.service.BackOfficePromoCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/backoffice/promo-codes", "/api/backoffice/promo-codes"})
@RequiredArgsConstructor
public class BackOfficePromoCodeController implements IBackOfficePromoCodeController {

    private final BackOfficePromoCodeService backOfficePromoCodeService;

    @Override
    public ResponseEntity<List<BackOfficePromoCodeDto>> getAll() {
        return ResponseEntity.ok(backOfficePromoCodeService.getAll());
    }

    @Override
    public ResponseEntity<BackOfficePromoCodeDto> getById(Long id) {
        return ResponseEntity.ok(backOfficePromoCodeService.getById(id));
    }

    @Override
    public ResponseEntity<PromoCodeStatsDto> getStats(Integer days) {
        return ResponseEntity.ok(backOfficePromoCodeService.getStats(days));
    }

    @Override
    public ResponseEntity<BackOfficePromoCodeDto> create(BackOfficePromoCodeDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficePromoCodeService.create(dto));
    }

    @Override
    public ResponseEntity<BackOfficePromoCodeDto> update(Long id, BackOfficePromoCodeDto dto) {
        return ResponseEntity.ok(backOfficePromoCodeService.update(id, dto));
    }

    @Override
    public ResponseEntity<Void> delete(Long id) {
        backOfficePromoCodeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
