package com.lifeevent.lid.message.controller;

import com.lifeevent.lid.backoffice.lid.message.dto.BackOfficeMessageDto;
import com.lifeevent.lid.backoffice.lid.message.dto.CreateBackOfficeMessageRequest;
import com.lifeevent.lid.backoffice.lid.message.service.BackOfficeMessageService;
import com.lifeevent.lid.message.dto.PublicContactRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/contact")
@RequiredArgsConstructor
public class PublicContactController {

    private final BackOfficeMessageService backOfficeMessageService;

    @PostMapping
    public BackOfficeMessageDto send(@Valid @RequestBody PublicContactRequest request) {
        String subject = "Contact - " + request.getSubject().trim();
        StringBuilder body = new StringBuilder();
        body.append("Nom: ").append(request.getLastName().trim()).append("\n");
        body.append("Prénom: ").append(request.getFirstName().trim()).append("\n");
        body.append("Email: ").append(request.getEmail().trim()).append("\n");
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            body.append("Téléphone: ").append(request.getPhone().trim()).append("\n");
        }
        body.append("\n").append(request.getMessage().trim());
        return backOfficeMessageService.createPublicContactMessage(
                CreateBackOfficeMessageRequest.builder()
                        .subject(subject)
                        .body(body.toString())
                        .recipients(null)
                        .build()
        );
    }
}
