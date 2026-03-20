package com.lifeevent.lid.stock.dto;

import com.lifeevent.lid.article.entity.Article;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockDto {
    private Long id;
    private Long articleId;
    private Integer quantityAvailable;
    private Integer quantityReserved;
    private String lot;
    private LocalDate bestBefore;

    private Integer totalQuantity; // quantityAvailable + quantityReserved
}
