package com.lifeevent.lid.backoffice.marketing.mapper;

import com.lifeevent.lid.backoffice.marketing.dto.BackOfficeMarketingCampaignDto;
import com.lifeevent.lid.marketing.entity.MarketingCampaign;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface BackOfficeMarketingCampaignMapper {

    BackOfficeMarketingCampaignDto toDto(MarketingCampaign entity);

    MarketingCampaign toEntity(BackOfficeMarketingCampaignDto dto);

    List<BackOfficeMarketingCampaignDto> toDtoList(List<MarketingCampaign> entities);

    void updateEntityFromDto(BackOfficeMarketingCampaignDto dto, @MappingTarget MarketingCampaign entity);
}
