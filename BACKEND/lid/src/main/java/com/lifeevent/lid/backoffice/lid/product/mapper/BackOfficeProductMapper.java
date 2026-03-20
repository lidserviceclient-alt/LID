package com.lifeevent.lid.backoffice.lid.product.mapper;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.backoffice.lid.product.dto.BackOfficeProductDto;
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
public interface BackOfficeProductMapper {

    @Mapping(target = "status", ignore = true)
    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "stock", ignore = true)
    BackOfficeProductDto toDto(Article entity);

    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "referencePartner", ignore = true)
    @Mapping(target = "discountPercent", ignore = true)
    @Mapping(target = "isFlashSale", ignore = true)
    @Mapping(target = "flashSaleEndsAt", ignore = true)
    Article toEntity(BackOfficeProductDto dto);

    List<BackOfficeProductDto> toDtoList(List<Article> entities);

    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "referencePartner", ignore = true)
    @Mapping(target = "discountPercent", ignore = true)
    @Mapping(target = "isFlashSale", ignore = true)
    @Mapping(target = "flashSaleEndsAt", ignore = true)
    void updateEntityFromDto(BackOfficeProductDto dto, @MappingTarget Article entity);
}
