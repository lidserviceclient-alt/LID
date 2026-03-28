package com.lifeevent.lid.backoffice.lid.recipient.controller;

import com.lifeevent.lid.backoffice.lid.recipient.service.BackOfficeRecipientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/backoffice/recipients", "/api/backoffice/recipients"})
@RequiredArgsConstructor
public class BackOfficeRecipientController implements IBackOfficeRecipientController {

    private final BackOfficeRecipientService backOfficeRecipientService;

    @Override
    public ResponseEntity<List<String>> getRecipients(
            BackOfficeRecipientService.Segment segment,
            List<String> roles,
            String q,
            Integer limit
    ) {
        return ResponseEntity.ok(backOfficeRecipientService.getRecipientEmails(segment, roles, q, limit));
    }
}
