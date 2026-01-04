package com.lifeevent.lid.article.mapper;

import com.lifeevent.lid.article.dto.ArticleDto;
import com.lifeevent.lid.article.entity.Article;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = CategoryMapper.class)
public interface ArticleMapper {

    /**
     * Convertir une entité Article en ArticleDto
     */
    ArticleDto toDto(Article article);

    /**
     * Convertir un ArticleDto en entité Article
     */
    Article toEntity(ArticleDto dto);

    /**
     * Convertir une liste d'Articles en liste de ArticleDtos
     */
    List<ArticleDto> toDtoList(List<Article> articles);

    /**
     * Convertir une liste de ArticleDtos en liste d'Articles
     */
    List<Article> toEntityList(List<ArticleDto> dtos);

    /**
     * Mettre à jour une entité Article à partir d'un ArticleDto
     */
    void updateEntityFromDto(ArticleDto dto, @MappingTarget Article article);
}
