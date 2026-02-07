package com.lifeevent.lid.backoffice.promo.service.impl;

import com.lifeevent.lid.backoffice.promo.dto.BackOfficePromoCodeDto;
import com.lifeevent.lid.backoffice.promo.dto.PromoCodeStatsDto;
import com.lifeevent.lid.backoffice.promo.mapper.BackOfficePromoCodeMapper;
import com.lifeevent.lid.backoffice.promo.service.BackOfficePromoCodeService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.discount.entity.Discount;
import com.lifeevent.lid.discount.enumeration.DiscountTarget;
import com.lifeevent.lid.discount.repository.DiscountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BackOfficePromoCodeServiceImpl implements BackOfficePromoCodeService {

    private final DiscountRepository discountRepository;
    private final BackOfficePromoCodeMapper backOfficePromoCodeMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BackOfficePromoCodeDto> getAll() {
        List<BackOfficePromoCodeDto> dtos = backOfficePromoCodeMapper.toDtoList(discountRepository.findAll());
        for (BackOfficePromoCodeDto dto : dtos) {
            hydrateTarget(dto);
            dto.setTotalReduction(0d);
        }
        return dtos;
    }

    @Override
    public BackOfficePromoCodeDto create(BackOfficePromoCodeDto dto) {
        Discount entity = backOfficePromoCodeMapper.toEntity(dto);
        Discount saved = discountRepository.save(entity);
        BackOfficePromoCodeDto out = backOfficePromoCodeMapper.toDto(saved);
        hydrateTarget(out);
        out.setTotalReduction(0d);
        return out;
    }

    @Override
    public BackOfficePromoCodeDto update(Long id, BackOfficePromoCodeDto dto) {
        Discount entity = discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount", "id", id.toString()));
        backOfficePromoCodeMapper.updateEntityFromDto(dto, entity);
        Discount saved = discountRepository.save(entity);
        BackOfficePromoCodeDto out = backOfficePromoCodeMapper.toDto(saved);
        hydrateTarget(out);
        out.setTotalReduction(0d);
        return out;
    }

    @Override
    public void delete(Long id) {
        if (!discountRepository.existsById(id)) {
            throw new ResourceNotFoundException("Discount", "id", id.toString());
        }
        discountRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public PromoCodeStatsDto getStats(Integer days) {
        int count = days == null || days <= 0 ? 30 : days;
        List<Long> series = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            series.add(0L);
        }
        return PromoCodeStatsDto.builder()
                .totalUsages(0L)
                .totalReduction(0d)
                .usageSeries(series)
                .build();
    }

    private void hydrateTarget(BackOfficePromoCodeDto dto) {
        if (dto == null || dto.getCible() == null) return;
        DiscountTarget target = dto.getCible();
        if (target == DiscountTarget.BOUTIQUE) {
            dto.setBoutiqueId(dto.getBoutiqueId() != null ? dto.getBoutiqueId() : null);
        } else if (target == DiscountTarget.UTILISATEUR) {
            dto.setUtilisateurId(dto.getUtilisateurId() != null ? dto.getUtilisateurId() : null);
        }
    }
}
