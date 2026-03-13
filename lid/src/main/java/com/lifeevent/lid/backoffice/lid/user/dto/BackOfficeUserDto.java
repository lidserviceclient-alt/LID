package com.lifeevent.lid.backoffice.lid.user.dto;

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
    private String password;
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
