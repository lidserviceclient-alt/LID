package com.lifeevent.lid.user.customer.mapper;

import com.lifeevent.lid.user.customer.dto.CustomerAddressDto;
import com.lifeevent.lid.user.customer.entity.CustomerAddress;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface CustomerAddressMapper {
    CustomerAddressDto toDto(CustomerAddress entity);

    List<CustomerAddressDto> toDtoList(List<CustomerAddress> entities);

    CustomerAddress toEntity(CustomerAddressDto dto);

    void updateEntityFromDto(CustomerAddressDto dto, @MappingTarget CustomerAddress entity);
}
