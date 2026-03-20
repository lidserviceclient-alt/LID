package com.lifeevent.lid.stock.mapper;

import com.lifeevent.lid.stock.dto.StockDto;
import com.lifeevent.lid.stock.entity.Stock;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface StockMapper {

    /**
     * Convertir une entité Stock en StockDto
     */
    @Mapping(source = "article.id", target = "articleId")
    @Mapping(target = "totalQuantity", expression = "java(stock.getQuantityAvailable() + stock.getQuantityReserved())")
    StockDto toDto(Stock stock);

    /**
     * Convertir un StockDto en entité Stock
     */
    @Mapping(target = "article", ignore = true)
    Stock toEntity(StockDto dto);

    /**
     * Convertir une liste de Stocks en liste de StockDtos
     */
    List<StockDto> toDtoList(List<Stock> stocks);

    /**
     * Convertir une liste de StockDtos en liste de Stocks
     */
    List<Stock> toEntityList(List<StockDto> dtos);

    /**
     * Mettre à jour une entité Stock à partir d'un StockDto
     */
    @Mapping(target = "article", ignore = true)
    void updateEntityFromDto(StockDto dto, @MappingTarget Stock stock);
}
