package com.lifeevent.lid.backoffice.loyalty.mapper;

import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyTierDto;
import com.lifeevent.lid.loyalty.entity.LoyaltyTier;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface BackOfficeLoyaltyTierMapper {
    BackOfficeLoyaltyTierDto toDto(LoyaltyTier entity);
    LoyaltyTier toEntity(BackOfficeLoyaltyTierDto dto);
    List<BackOfficeLoyaltyTierDto> toDtoList(List<LoyaltyTier> entities);
    void updateEntityFromDto(BackOfficeLoyaltyTierDto dto, @MappingTarget LoyaltyTier entity);
}
