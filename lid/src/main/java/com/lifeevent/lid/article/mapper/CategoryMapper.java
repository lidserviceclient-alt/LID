package com.lifeevent.lid.article.mapper;

import com.lifeevent.lid.article.dto.CategoryDto;
import com.lifeevent.lid.article.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface CategoryMapper {

    /**
     * Convertir une entité Category en CategoryDto
     */
    CategoryDto toDto(Category category);

    /**
     * Convertir un CategoryDto en entité Category
     */
    Category toEntity(CategoryDto dto);

    /**
     * Convertir une liste de Categories en liste de CategoryDtos
     */
    List<CategoryDto> toDtoList(List<Category> categories);

    /**
     * Convertir une liste de CategoryDtos en liste de Categories
     */
    List<Category> toEntityList(List<CategoryDto> dtos);

    /**
     * Mettre à jour une entité Category à partir d'un CategoryDto
     */
    void updateEntityFromDto(CategoryDto dto, @MappingTarget Category category);
}
