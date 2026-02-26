package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.BackofficeMessageDto;
import com.lifeevent.lid.core.dto.CreateBackofficeMessageRequest;
import com.lifeevent.lid.core.dto.PublicContactRequest;
import com.lifeevent.lid.core.service.BackofficeMessageService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/contact")
public class PublicContactController {

    private final BackofficeMessageService messageService;

    public PublicContactController(BackofficeMessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping
    public BackofficeMessageDto send(@Valid @RequestBody PublicContactRequest request) {
        String subject = "Contact - " + request.subject().trim();

        StringBuilder body = new StringBuilder();
        body.append("Nom: ").append(request.lastName().trim()).append("\n");
        body.append("Prénom: ").append(request.firstName().trim()).append("\n");
        body.append("Email: ").append(request.email().trim()).append("\n");
        if (request.phone() != null && !request.phone().trim().isEmpty()) {
            body.append("Téléphone: ").append(request.phone().trim()).append("\n");
        }
        body.append("\n");
        body.append(request.message().trim());

        return messageService.createAndSend(new CreateBackofficeMessageRequest(subject, body.toString(), null));
    }
}

