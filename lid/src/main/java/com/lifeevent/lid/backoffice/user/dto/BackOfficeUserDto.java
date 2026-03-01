package com.lifeevent.lid.backoffice.user.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeUserDto {
    private String id;
    private String prenom;
    private String nom;
    private String email;
    private Boolean emailVerifie;
    private Boolean blocked;
    private String role;
    private String telephone;
    private String ville;
    private String pays;
    private String avatarUrl;
    private LocalDateTime dateCreation;
    private LocalDateTime dateMiseAJour;
    private List<BackOfficeUserAuthDto> authentifications;
}
