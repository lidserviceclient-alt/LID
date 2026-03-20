package com.lifeevent.lid.backoffice.partner.preference.controller;

import com.lifeevent.lid.backoffice.partner.preference.dto.PartnerPreferencesDto;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "BackOffice - Partner Preferences", description = "Préférences pour le partner connecté")
@SecurityRequirement(name = "Bearer Token")
public interface IBackOfficePartnerPreferencesController {

    @GetMapping
    ResponseEntity<PartnerPreferencesDto> getMine();

    @PutMapping
    ResponseEntity<PartnerPreferencesDto> updateMine(@RequestBody PartnerPreferencesDto dto);
}

