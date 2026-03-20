package com.lifeevent.lid.backoffice.lid.user.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeUserAuthDto {
    private String fournisseur;
    private String identifiantFournisseur;
    private LocalDateTime dateCreation;
}
