package com.lifeevent.lid.backoffice.lid.message.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBackOfficeMessageRequest {
    @NotBlank
    private String subject;
    @NotBlank
    private String body;
    private List<String> recipients;
}
