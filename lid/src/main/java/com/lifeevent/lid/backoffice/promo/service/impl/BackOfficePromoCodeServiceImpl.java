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
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

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
            enrichDto(dto);
        }
        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficePromoCodeDto getById(Long id) {
        Discount entity = findByIdOrThrow(id);
        BackOfficePromoCodeDto dto = backOfficePromoCodeMapper.toDto(entity);
        enrichDto(dto);
        return dto;
    }

    @Override
    public BackOfficePromoCodeDto create(BackOfficePromoCodeDto dto) {
        Discount entity = backOfficePromoCodeMapper.toEntity(dto);
        Discount saved = discountRepository.save(entity);
        BackOfficePromoCodeDto out = backOfficePromoCodeMapper.toDto(saved);
        enrichDto(out);
        return out;
    }

    @Override
    public BackOfficePromoCodeDto update(Long id, BackOfficePromoCodeDto dto) {
        Discount entity = findByIdOrThrow(id);
        backOfficePromoCodeMapper.updateEntityFromDto(dto, entity);
        Discount saved = discountRepository.save(entity);
        BackOfficePromoCodeDto out = backOfficePromoCodeMapper.toDto(saved);
        enrichDto(out);
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
        int count = normalizeDays(days);
        List<Discount> discounts = discountRepository.findAll();

        long totalUsages = 0L;
        double totalReduction = 0d;
        for (Discount discount : discounts) {
            int usageCount = discount.getUsageCount() == null ? 0 : Math.max(0, discount.getUsageCount());
            double value = discount.getValue() == null ? 0d : Math.max(0d, discount.getValue());
            totalUsages += usageCount;
            totalReduction += (usageCount * value);
        }

        List<Long> series = buildUsageSeries(discounts, count);
        return PromoCodeStatsDto.builder()
                .totalUsages(totalUsages)
                .totalReduction(totalReduction)
                .usageSeries(series)
                .build();
    }

    private int normalizeDays(Integer days) {
        if (days == null) {
            return 30;
        }
        return Math.max(1, Math.min(days, 365));
    }

    private List<Long> buildUsageSeries(List<Discount> discounts, int days) {
        LocalDate start = LocalDate.now().minusDays(days - 1L);
        Map<LocalDate, Long> usageByDay = new HashMap<>();

        for (Discount discount : discounts) {
            if (discount == null || discount.getCreatedAt() == null) {
                continue;
            }
            LocalDate day = discount.getCreatedAt().toLocalDate();
            long usageCount = discount.getUsageCount() == null ? 0L : Math.max(0, discount.getUsageCount());
            usageByDay.merge(day, usageCount, Long::sum);
        }

        List<Long> series = new ArrayList<>(days);
        for (int i = 0; i < days; i++) {
            LocalDate day = start.plusDays(i);
            series.add(usageByDay.getOrDefault(day, 0L));
        }
        return series;
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

    private void enrichDto(BackOfficePromoCodeDto dto) {
        hydrateTarget(dto);
        if (dto != null) {
            dto.setTotalReduction(0d);
        }
    }

    private Discount findByIdOrThrow(Long id) {
        return discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount", "id", id.toString()));
    }
}
