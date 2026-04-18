package com.lifeevent.lid.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketEventDto {
    private Long id;
    private String title;
    private String description;
    private String location;
    private LocalDateTime date;
    private LocalDateTime eventDate;
    private Double price;
    private String imageUrl;
    private String category;
    private Boolean available;
    private Integer quantityAvailable;
    private Integer quantityReserved;
    private Boolean sellable;
}
