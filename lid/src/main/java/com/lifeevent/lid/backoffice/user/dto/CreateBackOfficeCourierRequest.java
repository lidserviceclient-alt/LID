package com.lifeevent.lid.backoffice.user.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBackOfficeCourierRequest {
    private String prenom;
    private String nom;
    private String email;
    private String telephone;
    private String password;
}
