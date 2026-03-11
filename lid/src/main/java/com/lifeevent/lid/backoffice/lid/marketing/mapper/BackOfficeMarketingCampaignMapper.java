package com.lifeevent.lid.backoffice.lid.marketing.mapper;

import com.lifeevent.lid.backoffice.lid.marketing.dto.BackOfficeMarketingCampaignDto;
import com.lifeevent.lid.marketing.entity.MarketingCampaign;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface BackOfficeMarketingCampaignMapper {

    @Mapping(source = "sentCount", target = "sent")
    @Mapping(source = "failedCount", target = "failed")
    @Mapping(source = "dateCreation", target = "createdAt")
    BackOfficeMarketingCampaignDto toDto(MarketingCampaign entity);

    @Mapping(source = "sent", target = "sentCount")
    @Mapping(source = "failed", target = "failedCount")
    @Mapping(source = "createdAt", target = "dateCreation")
    MarketingCampaign toEntity(BackOfficeMarketingCampaignDto dto);

    List<BackOfficeMarketingCampaignDto> toDtoList(List<MarketingCampaign> entities);

    @Mapping(source = "sent", target = "sentCount")
    @Mapping(source = "failed", target = "failedCount")
    @Mapping(source = "createdAt", target = "dateCreation")
    void updateEntityFromDto(BackOfficeMarketingCampaignDto dto, @MappingTarget MarketingCampaign entity);
}
