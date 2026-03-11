package com.lifeevent.lid.backoffice.lid.stock.mapper;

import com.lifeevent.lid.backoffice.lid.stock.dto.BackOfficeStockMovementDto;
import com.lifeevent.lid.stock.entity.StockMovement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface BackOfficeStockMovementMapper {

    @Mapping(source = "article.sku", target = "sku")
    BackOfficeStockMovementDto toDto(StockMovement entity);

    List<BackOfficeStockMovementDto> toDtoList(List<StockMovement> entities);
}
