package com.lifeevent.lid.backoffice.lid.promo.service;

import com.lifeevent.lid.backoffice.lid.promo.dto.BackOfficePromoCodeDto;
import com.lifeevent.lid.backoffice.lid.promo.dto.PromoCodeStatsDto;
import org.springframework.data.domain.Page;

public interface BackOfficePromoCodeService {
    Page<BackOfficePromoCodeDto> getAll(int page, int size);
    BackOfficePromoCodeDto getById(Long id);
    BackOfficePromoCodeDto create(BackOfficePromoCodeDto dto);
    BackOfficePromoCodeDto update(Long id, BackOfficePromoCodeDto dto);
    void delete(Long id);
    PromoCodeStatsDto getStats(Integer days);
}
