package com.lifeevent.lid.backoffice.lid.customer.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeCustomerDto {
    private String id;
    private String name;
    private Integer orders;
    private Double spent;
    private LocalDateTime lastOrder;

    private String prenom;
    private String nom;
    private String email;
    private String telephone;
    private String ville;
    private String pays;
}
