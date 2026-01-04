package com.lifeevent.lid.payment.mapper;

import com.lifeevent.lid.payment.dto.PaymentResponseDto;
import com.lifeevent.lid.payment.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    /**
     * Convertir une entité Payment en PaymentResponseDto
     */
    PaymentResponseDto toDto(Payment payment);

    /**
     * Convertir un PaymentResponseDto en entité Payment
     */
    Payment toEntity(PaymentResponseDto dto);

    /**
     * Convertir une liste de Payments en liste de PaymentResponseDtos
     */
    List<PaymentResponseDto> toDtoList(List<Payment> payments);

    /**
     * Convertir une liste de PaymentResponseDtos en liste de Payments
     */
    List<Payment> toEntityList(List<PaymentResponseDto> dtos);

    /**
     * Mettre à jour une entité Payment à partir d'un PaymentResponseDto
     */
    void updateEntityFromDto(PaymentResponseDto dto, @MappingTarget Payment payment);
}
