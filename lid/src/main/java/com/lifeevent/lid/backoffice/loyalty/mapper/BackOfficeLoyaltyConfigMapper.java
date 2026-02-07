package com.lifeevent.lid.backoffice.loyalty.mapper;

import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyConfigDto;
import com.lifeevent.lid.loyalty.entity.LoyaltyConfig;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface BackOfficeLoyaltyConfigMapper {
    BackOfficeLoyaltyConfigDto toDto(LoyaltyConfig entity);
    LoyaltyConfig toEntity(BackOfficeLoyaltyConfigDto dto);
    List<BackOfficeLoyaltyConfigDto> toDtoList(List<LoyaltyConfig> entities);
    void updateEntityFromDto(BackOfficeLoyaltyConfigDto dto, @MappingTarget LoyaltyConfig entity);
}
