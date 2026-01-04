package com.lifeevent.lid.cart.mapper;

import com.lifeevent.lid.article.mapper.ArticleMapper;
import com.lifeevent.lid.cart.dto.CartArticleDto;
import com.lifeevent.lid.cart.entity.CartArticle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = ArticleMapper.class)
public interface CartArticleMapper {

    /**
     * Convertir une entité CartArticle en CartArticleDto
     */
    @Mapping(source = "article", target = "article")
    CartArticleDto toDto(CartArticle cartArticle);

    /**
     * Convertir un CartArticleDto en entité CartArticle
     */
    CartArticle toEntity(CartArticleDto dto);

    /**
     * Convertir une liste de CartArticles en liste de CartArticleDtos
     */
    List<CartArticleDto> toDtoList(List<CartArticle> cartArticles);

    /**
     * Convertir une liste de CartArticleDtos en liste de CartArticles
     */
    List<CartArticle> toEntityList(List<CartArticleDto> dtos);

    /**
     * Mettre à jour une entité CartArticle à partir d'un CartArticleDto
     */
    void updateEntityFromDto(CartArticleDto dto, @MappingTarget CartArticle cartArticle);
}
