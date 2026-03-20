package com.lifeevent.lid.user.partner.mapper;

import com.lifeevent.lid.user.partner.dto.ShopDto;
import com.lifeevent.lid.user.partner.entity.Shop;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * Mapper MapStruct pour les conversions Shop ↔ ShopDto
 */
@Mapper(componentModel = "spring")
public interface ShopMapper {
    
    /**
     * Convertir Shop entity → ShopDto
     * Récupère l'ID de la Category depuis la relation mainCategory
     */
    @Mapping(source = "mainCategory.id", target = "mainCategoryId")
    ShopDto toDto(Shop shop);
    
    /**
     * Convertir ShopDto → Shop entity
     * Ne peut pas créer la Category automatiquement (elle doit être passée via Repository)
     * Donc on ne mappe que les champs simples
     */
    @Mapping(target = "mainCategory", ignore = true)
    @Mapping(target = "partner", ignore = true)
    Shop toEntity(ShopDto dto);
    
    /**
     * Mettre à jour une Shop
     */
    @Mapping(target = "mainCategory", ignore = true)
    @Mapping(target = "partner", ignore = true)
    void updateEntityFromDto(ShopDto dto, @MappingTarget Shop shop);
}
