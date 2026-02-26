package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.enums.RoleUtilisateur;
import com.lifeevent.lid.core.service.RecipientService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/backoffice/recipients")
public class BackofficeRecipientsController {

    private final RecipientService service;

    public BackofficeRecipientsController(RecipientService service) {
        this.service = service;
    }

    @GetMapping
    public List<String> list(
            @RequestParam(value = "segment", defaultValue = "CLIENT") RecipientService.Segment segment,
            @RequestParam(value = "roles", required = false) List<RoleUtilisateur> roles,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "limit", defaultValue = "200") int limit
    ) {
        List<RoleUtilisateur> safeRoles = roles == null ? new ArrayList<>() : roles;
        return service.listEmails(segment, safeRoles, q, limit);
    }
}

