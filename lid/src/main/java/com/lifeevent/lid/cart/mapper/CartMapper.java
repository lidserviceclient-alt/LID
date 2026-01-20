package com.lifeevent.lid.cart.mapper;

import com.lifeevent.lid.cart.dto.CartDto;
import com.lifeevent.lid.cart.entity.Cart;
import com.lifeevent.lid.user.customer.mapper.CustomerMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {CustomerMapper.class, CartArticleMapper.class}, unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface CartMapper {

    /**
     * Convertir une entité Cart en CartDto
     */
    @Mapping(target = "totalPrice", ignore = true)
    @Mapping(target = "totalQuantity", ignore = true)
    CartDto toDto(Cart cart);

    /**
     * Convertir un CartDto en entité Cart
     */
    Cart toEntity(CartDto dto);

    /**
     * Convertir une liste de Carts en liste de CartDtos
     */
    List<CartDto> toDtoList(List<Cart> carts);

    /**
     * Convertir une liste de CartDtos en liste de Carts
     */
    List<Cart> toEntityList(List<CartDto> dtos);

    /**
     * Mettre à jour une entité Cart à partir d'un CartDto
     */
    void updateEntityFromDto(CartDto dto, @MappingTarget Cart cart);
}
