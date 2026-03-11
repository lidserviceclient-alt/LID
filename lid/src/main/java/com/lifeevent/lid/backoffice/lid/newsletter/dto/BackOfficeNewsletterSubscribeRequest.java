package com.lifeevent.lid.backoffice.lid.newsletter.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeNewsletterSubscribeRequest {
    @NotBlank
    @Email
    private String email;
}
