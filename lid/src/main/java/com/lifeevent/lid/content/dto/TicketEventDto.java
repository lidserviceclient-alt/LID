package com.lifeevent.lid.content.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketEventDto {
    private String id;
    private String title;
    private LocalDateTime date;
    private String location;
    private BigDecimal price;
    private String imageUrl;
    private String category;
    private Boolean available;
    private String description;
}
