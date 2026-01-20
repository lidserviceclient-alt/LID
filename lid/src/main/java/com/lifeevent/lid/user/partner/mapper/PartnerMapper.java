package com.lifeevent.lid.user.partner.mapper;

import com.lifeevent.lid.user.partner.dto.*;
import com.lifeevent.lid.user.partner.entity.Partner;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

/**
 * Mapper MapStruct pour les conversions Partner ↔ DTOs
 */
@Mapper(componentModel = "spring", uses = {ShopMapper.class})
public interface PartnerMapper {
    
    /**
     * Convertir une entité Partner en PartnerResponseDto
     */
    PartnerResponseDto toResponseDto(Partner partner);
    
    /**
     * Convertir une liste de Partners en liste de PartnerResponseDtos
     */
    List<PartnerResponseDto> toResponseDtoList(List<Partner> partners);
    
    /**
     * Convertir un PartnerRegisterStep1RequestDto en entité Partner
     * Utilisé lors de la ÉTAPE 1 d'enregistrement
     */
    Partner toEntityFromStep1(PartnerRegisterStep1RequestDto dto);
    
    /**
     * Mettre à jour une entité Partner à partir d'un PartnerRegisterStep1RequestDto
     */
    void updateEntityFromStep1(PartnerRegisterStep1RequestDto dto, @MappingTarget Partner partner);
    
    /**
     * Mettre à jour une entité Partner à partir d'un PartnerRegisterStep3RequestDto
     */
    void updateEntityFromStep3(PartnerRegisterStep3RequestDto dto, @MappingTarget Partner partner);
}
