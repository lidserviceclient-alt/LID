package com.lifeevent.lid.backoffice.promo.service;

import com.lifeevent.lid.backoffice.promo.dto.BackOfficePromoCodeDto;
import com.lifeevent.lid.backoffice.promo.dto.PromoCodeStatsDto;

import java.util.List;

public interface BackOfficePromoCodeService {
    List<BackOfficePromoCodeDto> getAll();
    BackOfficePromoCodeDto getById(Long id);
    BackOfficePromoCodeDto create(BackOfficePromoCodeDto dto);
    BackOfficePromoCodeDto update(Long id, BackOfficePromoCodeDto dto);
    void delete(Long id);
    PromoCodeStatsDto getStats(Integer days);
}
