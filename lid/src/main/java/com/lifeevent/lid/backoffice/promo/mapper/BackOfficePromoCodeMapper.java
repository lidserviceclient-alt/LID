package com.lifeevent.lid.backoffice.promo.mapper;

import com.lifeevent.lid.backoffice.promo.dto.BackOfficePromoCodeDto;
import com.lifeevent.lid.discount.entity.Discount;
import com.lifeevent.lid.discount.enumeration.DiscountTarget;
import com.lifeevent.lid.discount.enumeration.DiscountType;
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
public interface BackOfficePromoCodeMapper {

    @Mapping(source = "value", target = "pourcentage")
    @Mapping(source = "target", target = "cible")
    @Mapping(source = "minOrderAmount", target = "montantMinCommande")
    @Mapping(source = "startAt", target = "dateDebut")
    @Mapping(source = "endAt", target = "dateFin")
    @Mapping(source = "usageMaxPerUser", target = "usageMaxParUtilisateur")
    @Mapping(source = "isActive", target = "estActif")
    @Mapping(source = "createdAt", target = "dateCreation")
    BackOfficePromoCodeDto toDto(Discount entity);

    @Mapping(target = "type", expression = "java(resolveType(dto))")
    @Mapping(target = "value", source = "pourcentage")
    @Mapping(source = "cible", target = "target")
    @Mapping(target = "targetId", expression = "java(resolveTargetId(dto))")
    @Mapping(source = "montantMinCommande", target = "minOrderAmount")
    @Mapping(source = "dateDebut", target = "startAt")
    @Mapping(source = "dateFin", target = "endAt")
    @Mapping(source = "usageMaxParUtilisateur", target = "usageMaxPerUser")
    @Mapping(source = "estActif", target = "isActive")
    Discount toEntity(BackOfficePromoCodeDto dto);

    @Mapping(target = "type", expression = "java(resolveType(dto))")
    @Mapping(target = "value", source = "pourcentage")
    @Mapping(source = "cible", target = "target")
    @Mapping(target = "targetId", expression = "java(resolveTargetId(dto))")
    @Mapping(source = "montantMinCommande", target = "minOrderAmount")
    @Mapping(source = "dateDebut", target = "startAt")
    @Mapping(source = "dateFin", target = "endAt")
    @Mapping(source = "usageMaxParUtilisateur", target = "usageMaxPerUser")
    @Mapping(source = "estActif", target = "isActive")
    void updateEntityFromDto(BackOfficePromoCodeDto dto, @MappingTarget Discount entity);

    List<BackOfficePromoCodeDto> toDtoList(List<Discount> entities);

    default DiscountType resolveType(BackOfficePromoCodeDto dto) {
        if (dto == null) return DiscountType.PERCENTAGE;
        return DiscountType.PERCENTAGE;
    }

    default String resolveTargetId(BackOfficePromoCodeDto dto) {
        if (dto == null) return null;
        DiscountTarget target = dto.getCible();
        if (target == null) return null;
        return switch (target) {
            case BOUTIQUE -> dto.getBoutiqueId();
            case UTILISATEUR -> dto.getUtilisateurId();
            default -> null;
        };
    }
}
