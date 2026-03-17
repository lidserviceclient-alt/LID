package com.lifeevent.lid.backoffice.lid.promo.service.impl;

import com.lifeevent.lid.backoffice.lid.promo.dto.BackOfficePromoCodeDto;
import com.lifeevent.lid.backoffice.lid.promo.dto.PromoCodeStatsDto;
import com.lifeevent.lid.backoffice.lid.promo.mapper.BackOfficePromoCodeMapper;
import com.lifeevent.lid.backoffice.lid.promo.service.BackOfficePromoCodeService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.discount.entity.Discount;
import com.lifeevent.lid.discount.enumeration.DiscountTarget;
import com.lifeevent.lid.discount.repository.DiscountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    public List<BackOfficePromoCodeDto> getAll(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);
        List<BackOfficePromoCodeDto> dtos = backOfficePromoCodeMapper.toDtoList(
                discountRepository.findAll(PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent()
        );
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
        long totalUsages = discountRepository.sumUsageCount();
        double totalReduction = discountRepository.sumUsageReduction();
        List<Long> series = buildUsageSeries(count);
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

    private List<Long> buildUsageSeries(int days) {
        LocalDate start = LocalDate.now().minusDays(days - 1L);
        LocalDateTime from = start.atStartOfDay();
        Map<LocalDate, Long> usageByDay = new HashMap<>();

        for (DiscountRepository.DailyUsageView row : discountRepository.aggregateUsageByDayFrom(from)) {
            if (row == null || row.getDay() == null) {
                continue;
            }
            long usageCount = row.getUsage() == null ? 0L : Math.max(0L, row.getUsage());
            usageByDay.put(row.getDay(), usageCount);
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
