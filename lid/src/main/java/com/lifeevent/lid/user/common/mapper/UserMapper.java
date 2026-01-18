package com.lifeevent.lid.user.common.mapper;

import com.lifeevent.lid.user.common.dto.UserDto;
import com.lifeevent.lid.user.common.entity.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Convertir une entité User en UserDto
     */
    UserDto toDto(UserEntity User);

    /**
     * Convertir un UserDto en entité User
     */
    UserEntity toEntity(UserDto dto);

    /**
     * Convertir une liste de Users en liste de UserDtos
     */
    List<UserDto> toDtoList(List<UserEntity> Users);

    /**
     * Convertir une liste de UserDtos en liste de Users
     */
    List<UserEntity> toEntityList(List<UserDto> dtos);

}
