package com.lifeevent.lid.payment.mapper;

import com.lifeevent.lid.payment.dto.RefundResponseDto;
import com.lifeevent.lid.payment.entity.Refund;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RefundMapper {

    /**
     * Convertir une entité Refund en RefundResponseDto
     */
    RefundResponseDto toDto(Refund refund);

    /**
     * Convertir un RefundResponseDto en entité Refund
     */
    Refund toEntity(RefundResponseDto dto);

    /**
     * Convertir une liste de Refunds en liste de RefundResponseDtos
     */
    List<RefundResponseDto> toDtoList(List<Refund> refunds);

    /**
     * Convertir une liste de RefundResponseDtos en liste de Refunds
     */
    List<Refund> toEntityList(List<RefundResponseDto> dtos);

    /**
     * Mettre à jour une entité Refund à partir d'un RefundResponseDto
     */
    void updateEntityFromDto(RefundResponseDto dto, @MappingTarget Refund refund);
}
