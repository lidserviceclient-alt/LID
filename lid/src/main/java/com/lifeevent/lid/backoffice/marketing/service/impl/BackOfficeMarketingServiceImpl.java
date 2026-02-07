package com.lifeevent.lid.backoffice.marketing.service.impl;

import com.lifeevent.lid.backoffice.marketing.dto.BackOfficeMarketingCampaignDto;
import com.lifeevent.lid.backoffice.marketing.dto.MarketingChannelShareDto;
import com.lifeevent.lid.backoffice.marketing.dto.MarketingOverviewDto;
import com.lifeevent.lid.backoffice.marketing.mapper.BackOfficeMarketingCampaignMapper;
import com.lifeevent.lid.backoffice.marketing.service.BackOfficeMarketingService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.marketing.entity.MarketingCampaign;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignStatus;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignType;
import com.lifeevent.lid.marketing.repository.MarketingCampaignRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BackOfficeMarketingServiceImpl implements BackOfficeMarketingService {

    private final MarketingCampaignRepository marketingCampaignRepository;
    private final BackOfficeMarketingCampaignMapper backOfficeMarketingCampaignMapper;

    @Override
    @Transactional(readOnly = true)
    public MarketingOverviewDto getOverview(Integer days) {
        // Stub: no tracking yet
        List<MarketingChannelShareDto> channels = List.of(
                new MarketingChannelShareDto(MarketingCampaignType.EMAIL, 0d),
                new MarketingChannelShareDto(MarketingCampaignType.SMS, 0d),
                new MarketingChannelShareDto(MarketingCampaignType.SOCIAL, 0d)
        );
        return MarketingOverviewDto.builder()
                .roiGlobal(0d)
                .budgetSpent(0d)
                .channels(channels)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeMarketingCampaignDto> getCampaigns(Pageable pageable, MarketingCampaignStatus status) {
        Page<MarketingCampaign> page = status == null
                ? marketingCampaignRepository.findAll(pageable)
                : marketingCampaignRepository.findByStatus(status, pageable);
        return page.map(backOfficeMarketingCampaignMapper::toDto);
    }

    @Override
    public BackOfficeMarketingCampaignDto createCampaign(BackOfficeMarketingCampaignDto dto) {
        MarketingCampaign entity = backOfficeMarketingCampaignMapper.toEntity(dto);
        applyDefaults(entity);
        MarketingCampaign saved = marketingCampaignRepository.save(entity);
        return backOfficeMarketingCampaignMapper.toDto(saved);
    }

    @Override
    public BackOfficeMarketingCampaignDto updateCampaign(Long id, BackOfficeMarketingCampaignDto dto) {
        MarketingCampaign entity = marketingCampaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MarketingCampaign", "id", id.toString()));
        backOfficeMarketingCampaignMapper.updateEntityFromDto(dto, entity);
        applyDefaults(entity);
        MarketingCampaign saved = marketingCampaignRepository.save(entity);
        return backOfficeMarketingCampaignMapper.toDto(saved);
    }

    @Override
    public void deleteCampaign(Long id) {
        if (!marketingCampaignRepository.existsById(id)) {
            throw new ResourceNotFoundException("MarketingCampaign", "id", id.toString());
        }
        marketingCampaignRepository.deleteById(id);
    }

    private void applyDefaults(MarketingCampaign entity) {
        if (entity.getStatus() == null) {
            entity.setStatus(MarketingCampaignStatus.ACTIVE);
        }
        if (entity.getType() == null) {
            entity.setType(MarketingCampaignType.EMAIL);
        }
        if (entity.getSent() == null) {
            entity.setSent(0);
        }
    }
}
