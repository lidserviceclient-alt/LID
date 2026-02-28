package com.lifeevent.lid.backoffice.message.mapper;

import com.lifeevent.lid.backoffice.message.dto.BackOfficeMessageDto;
import com.lifeevent.lid.message.entity.EmailMessage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface BackOfficeMessageMapper {

    @Mapping(source = "createdAt", target = "createdAt")
    BackOfficeMessageDto toDto(EmailMessage entity);
}
