package com.lifeevent.lid.backoffice.lid.blog.mapper;

import com.lifeevent.lid.backoffice.lid.blog.dto.BackOfficeBlogPostDto;
import com.lifeevent.lid.blog.entity.BlogPost;
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
public interface BackOfficeBlogPostMapper {

    @Mapping(source = "publishedAt", target = "date")
    BackOfficeBlogPostDto toDto(BlogPost entity);

    @Mapping(source = "date", target = "publishedAt")
    BlogPost toEntity(BackOfficeBlogPostDto dto);

    List<BackOfficeBlogPostDto> toDtoList(List<BlogPost> entities);

    @Mapping(source = "date", target = "publishedAt")
    void updateEntityFromDto(BackOfficeBlogPostDto dto, @MappingTarget BlogPost entity);
}
