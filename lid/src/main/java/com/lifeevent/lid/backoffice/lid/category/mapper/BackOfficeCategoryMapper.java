package com.lifeevent.lid.backoffice.lid.category.mapper;

import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.backoffice.lid.category.dto.BackOfficeCategoryDto;
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
public interface BackOfficeCategoryMapper {

    @Mapping(source = "name", target = "nom")
    @Mapping(source = "level", target = "niveau")
    @Mapping(source = "parentSlug", target = "parentId")
    @Mapping(source = "orderIdx", target = "ordre")
    @Mapping(source = "isActivated", target = "estActive")
    BackOfficeCategoryDto toDto(Category entity);

    @Mapping(source = "nom", target = "name")
    @Mapping(source = "niveau", target = "level")
    @Mapping(source = "parentId", target = "parentSlug")
    @Mapping(source = "ordre", target = "orderIdx")
    @Mapping(source = "estActive", target = "isActivated")
    Category toEntity(BackOfficeCategoryDto dto);

    List<BackOfficeCategoryDto> toDtoList(List<Category> entities);

    List<Category> toEntityList(List<BackOfficeCategoryDto> dtos);

    @Mapping(source = "nom", target = "name")
    @Mapping(source = "niveau", target = "level")
    @Mapping(source = "parentId", target = "parentSlug")
    @Mapping(source = "ordre", target = "orderIdx")
    @Mapping(source = "estActive", target = "isActivated")
    void updateEntityFromDto(BackOfficeCategoryDto dto, @MappingTarget Category entity);
}
