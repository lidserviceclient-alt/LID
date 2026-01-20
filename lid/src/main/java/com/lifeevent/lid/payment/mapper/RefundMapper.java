package com.lifeevent.lid.payment.mapper;

import com.lifeevent.lid.payment.dto.RefundResponseDto;
import com.lifeevent.lid.payment.entity.Refund;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

//@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface RefundMapper {

    /**
     * Convertir une entité Refund en RefundResponseDto
     */
    @Mapping(source = "payment.id", target = "paymentId")
    RefundResponseDto toDto(Refund refund);

    /**
     * Convertir un RefundResponseDto en entité Refund
     */
    @Mapping(target = "payment", ignore = true)
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
    @Mapping(target = "payment", ignore = true)
    void updateEntityFromDto(RefundResponseDto dto, @MappingTarget Refund refund);
}
