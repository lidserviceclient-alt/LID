package com.lifeevent.lid.backoffice.lid.recipient.controller;

import com.lifeevent.lid.backoffice.lid.recipient.service.BackOfficeRecipientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface IBackOfficeRecipientController {

    @GetMapping
    ResponseEntity<List<String>> getRecipients(
            @RequestParam(defaultValue = "CLIENT") BackOfficeRecipientService.Segment segment,
            @RequestParam(required = false) List<String> roles,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "200") Integer limit
    );
}
