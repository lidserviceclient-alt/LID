package com.lifeevent.lid.backoffice.lid.ticket.mapper;

import com.lifeevent.lid.backoffice.lid.ticket.dto.BackOfficeTicketEventDto;
import com.lifeevent.lid.ticket.entity.TicketEvent;
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
public interface BackOfficeTicketEventMapper {

    @Mapping(source = "eventDate", target = "date")
    BackOfficeTicketEventDto toDto(TicketEvent entity);

    @Mapping(source = "date", target = "eventDate")
    TicketEvent toEntity(BackOfficeTicketEventDto dto);

    List<BackOfficeTicketEventDto> toDtoList(List<TicketEvent> entities);

    @Mapping(source = "date", target = "eventDate")
    void updateEntityFromDto(BackOfficeTicketEventDto dto, @MappingTarget TicketEvent entity);
}
