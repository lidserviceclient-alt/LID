package com.lifeevent.lid.backoffice.recipient.controller;

import com.lifeevent.lid.auth.constant.UserRole;
import com.lifeevent.lid.backoffice.recipient.service.BackOfficeRecipientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface IBackOfficeRecipientController {

    @GetMapping
    ResponseEntity<List<String>> getRecipients(
            @RequestParam(defaultValue = "CLIENT") BackOfficeRecipientService.Segment segment,
            @RequestParam(required = false) List<UserRole> roles,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "200") Integer limit
    );
}
