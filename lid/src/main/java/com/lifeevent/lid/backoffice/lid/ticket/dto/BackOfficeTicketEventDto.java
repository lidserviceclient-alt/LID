package com.lifeevent.lid.backoffice.lid.ticket.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeTicketEventDto {
    private Long id;
    private String title;
    private LocalDateTime date;
    private String location;
    private Double price;
    private String imageUrl;
    private String category;
    private Boolean available;
    private String description;
}
