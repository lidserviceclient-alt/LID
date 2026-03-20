package com.lifeevent.lid.backoffice.partner.dto;

import com.lifeevent.lid.article.enumeration.ArticleStatus;

import java.time.LocalDateTime;

public record BackOfficePartnerProductDto(
        Long id,
        String name,
        String sku,
        String ean,
        Double price,
        Integer stock,
        ArticleStatus status,
        Boolean featured,
        Boolean bestSeller,
        LocalDateTime createdAt
) {
}
