package com.lifeevent.lid.backoffice.lid.promo.controller;

import com.lifeevent.lid.backoffice.lid.promo.dto.BackOfficePromoCodeDto;
import com.lifeevent.lid.backoffice.lid.promo.dto.BackOfficePromoCodeCollectionDto;
import com.lifeevent.lid.backoffice.lid.promo.dto.PromoCodeStatsDto;
import com.lifeevent.lid.backoffice.lid.promo.service.BackOfficePromoCodeCollectionService;
import com.lifeevent.lid.backoffice.lid.promo.service.BackOfficePromoCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/backoffice/promo-codes")
@RequiredArgsConstructor
public class BackOfficePromoCodeController implements IBackOfficePromoCodeController {

    private final BackOfficePromoCodeService backOfficePromoCodeService;
    private final BackOfficePromoCodeCollectionService backOfficePromoCodeCollectionService;

    @Override
    public ResponseEntity<BackOfficePromoCodeCollectionDto> getCollection(Integer days) {
        return ResponseEntity.ok(backOfficePromoCodeCollectionService.getCollection(days));
    }

    @Override
    public ResponseEntity<List<BackOfficePromoCodeDto>> getAll(int page, int size) {
        return ResponseEntity.ok(backOfficePromoCodeService.getAll(page, size));
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
