package com.lifeevent.lid.backoffice.lid.user.controller;

import com.lifeevent.lid.backoffice.lid.user.dto.BackOfficeUserDto;
import com.lifeevent.lid.backoffice.lid.user.dto.CreateBackOfficeCourierRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "BackOffice - Utilisateurs", description = "API back-office pour gérer les utilisateurs")
public interface IBackOfficeUserController {

    @GetMapping
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Lister les utilisateurs")
    @ApiResponse(responseCode = "200", description = "Liste paginée des utilisateurs")
    ResponseEntity<Page<BackOfficeUserDto>> getAll(
            @Parameter(description = "Page (0..N)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Filtre rôle") @RequestParam(required = false) String role,
            @Parameter(description = "Recherche") @RequestParam(required = false) String q
    );

    @GetMapping("/{id}")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Détail d'un utilisateur")
    ResponseEntity<BackOfficeUserDto> getById(
            @Parameter(description = "ID utilisateur", required = true) @PathVariable String id
    );

    @PostMapping
    ResponseEntity<BackOfficeUserDto> create(@RequestBody BackOfficeUserDto dto);

    @PostMapping("/couriers")
    ResponseEntity<BackOfficeUserDto> createCourier(@RequestBody CreateBackOfficeCourierRequest request);

    @PutMapping("/{id}")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Mettre à jour un utilisateur")
    ResponseEntity<BackOfficeUserDto> update(
            @Parameter(description = "ID utilisateur", required = true) @PathVariable String id,
            @RequestBody BackOfficeUserDto dto
    );

    @DeleteMapping("/{id}")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Supprimer un utilisateur")
    ResponseEntity<Void> delete(
            @Parameter(description = "ID utilisateur", required = true) @PathVariable String id
    );

    @PostMapping("/{id}/block")
    ResponseEntity<BackOfficeUserDto> block(
            @Parameter(description = "ID utilisateur", required = true) @PathVariable String id
    );

    @PostMapping("/{id}/unblock")
    ResponseEntity<BackOfficeUserDto> unblock(
            @Parameter(description = "ID utilisateur", required = true) @PathVariable String id
    );
}
