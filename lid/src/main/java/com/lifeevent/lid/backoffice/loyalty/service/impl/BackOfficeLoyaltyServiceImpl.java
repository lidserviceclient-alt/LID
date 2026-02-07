package com.lifeevent.lid.backoffice.loyalty.service.impl;

import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyConfigDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyOverviewDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyTierDto;
import com.lifeevent.lid.backoffice.loyalty.mapper.BackOfficeLoyaltyConfigMapper;
import com.lifeevent.lid.backoffice.loyalty.mapper.BackOfficeLoyaltyTierMapper;
import com.lifeevent.lid.backoffice.loyalty.service.BackOfficeLoyaltyService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.loyalty.entity.LoyaltyConfig;
import com.lifeevent.lid.loyalty.entity.LoyaltyTier;
import com.lifeevent.lid.loyalty.repository.LoyaltyConfigRepository;
import com.lifeevent.lid.loyalty.repository.LoyaltyTierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BackOfficeLoyaltyServiceImpl implements BackOfficeLoyaltyService {

    private final LoyaltyTierRepository loyaltyTierRepository;
    private final LoyaltyConfigRepository loyaltyConfigRepository;
    private final BackOfficeLoyaltyTierMapper backOfficeLoyaltyTierMapper;
    private final BackOfficeLoyaltyConfigMapper backOfficeLoyaltyConfigMapper;

    @Override
    @Transactional(readOnly = true)
    public BackOfficeLoyaltyOverviewDto getOverview() {
        // Stub: no tracking yet
        return BackOfficeLoyaltyOverviewDto.builder()
                .vipMembers(0L)
                .pointsDistributed(0L)
                .pointsValueFcfa(0d)
                .retentionRate(0d)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BackOfficeLoyaltyTierDto> getTiers() {
        return backOfficeLoyaltyTierMapper.toDtoList(loyaltyTierRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeLoyaltyConfigDto getConfig() {
        return loyaltyConfigRepository.findAll().stream().findFirst()
                .map(backOfficeLoyaltyConfigMapper::toDto)
                .orElseGet(() -> BackOfficeLoyaltyConfigDto.builder()
                        .pointsPerFcfa(0.001)
                        .valuePerPointFcfa(0.1)
                        .retentionDays(30)
                        .build());
    }

    @Override
    public BackOfficeLoyaltyConfigDto updateConfig(BackOfficeLoyaltyConfigDto dto) {
        LoyaltyConfig entity = loyaltyConfigRepository.findAll().stream().findFirst()
                .orElseGet(() -> LoyaltyConfig.builder()
                        .pointsPerFcfa(0.001)
                        .valuePerPointFcfa(0.1)
                        .retentionDays(30)
                        .build());
        backOfficeLoyaltyConfigMapper.updateEntityFromDto(dto, entity);
        LoyaltyConfig saved = loyaltyConfigRepository.save(entity);
        return backOfficeLoyaltyConfigMapper.toDto(saved);
    }

    @Override
    public BackOfficeLoyaltyTierDto updateTier(Long id, BackOfficeLoyaltyTierDto dto) {
        LoyaltyTier tier = loyaltyTierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LoyaltyTier", "id", id.toString()));
        backOfficeLoyaltyTierMapper.updateEntityFromDto(dto, tier);
        LoyaltyTier saved = loyaltyTierRepository.save(tier);
        return backOfficeLoyaltyTierMapper.toDto(saved);
    }
}
