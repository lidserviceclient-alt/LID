package com.lifeevent.lid.backoffice.logistics.mapper;

import com.lifeevent.lid.backoffice.logistics.dto.BackOfficeShipmentDto;
import com.lifeevent.lid.logistics.entity.Shipment;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface BackOfficeShipmentMapper {
    BackOfficeShipmentDto toDto(Shipment entity);
    Shipment toEntity(BackOfficeShipmentDto dto);
    List<BackOfficeShipmentDto> toDtoList(List<Shipment> entities);
    void updateEntityFromDto(BackOfficeShipmentDto dto, @MappingTarget Shipment entity);
}
