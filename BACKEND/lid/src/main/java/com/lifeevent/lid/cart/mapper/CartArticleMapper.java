package com.lifeevent.lid.cart.mapper;

import com.lifeevent.lid.article.mapper.ArticleMapper;
import com.lifeevent.lid.cart.dto.CartArticleDto;
import com.lifeevent.lid.cart.entity.CartArticle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface CartArticleMapper {

    /**
     * Convertir une entité CartArticle en CartArticleDto
     */
    CartArticleDto toDto(CartArticle cartArticle);

    /**
     * Convertir un CartArticleDto en entité CartArticle
     */
    @Mapping(target = "cart", ignore = true)
    @Mapping(target = "priceAtAddedTime", ignore = true)
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
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "cart", ignore = true)
    @Mapping(target = "priceAtAddedTime", ignore = true)
    void updateEntityFromDto(CartArticleDto dto, @MappingTarget CartArticle cartArticle);
}
