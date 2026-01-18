package com.lifeevent.lid.user.customer.mapper;

import com.lifeevent.lid.user.customer.dto.CustomerDto;
import com.lifeevent.lid.user.customer.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    /**
     * Convertir une entité Customer en CustomerDto
     */
    CustomerDto toDto(Customer customer);

    /**
     * Convertir un CustomerDto en entité Customer
     */
    Customer toEntity(CustomerDto dto);

    /**
     * Convertir une liste de Customers en liste de CustomerDtos
     */
    List<CustomerDto> toDtoList(List<Customer> customers);

    /**
     * Convertir une liste de CustomerDtos en liste de Customers
     */
    List<Customer> toEntityList(List<CustomerDto> dtos);

    /**
     * Mettre à jour une entité Customer à partir d'un CustomerDto
     */
    void updateEntityFromDto(CustomerDto dto, @MappingTarget Customer customer);
}
