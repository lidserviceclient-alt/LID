package com.lifeevent.lid.backoffice.user.controller;

import com.lifeevent.lid.backoffice.user.dto.BackOfficeUserDto;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "BackOffice - Utilisateurs", description = "API back-office pour gérer les utilisateurs")
public interface IBackOfficeUserController {

    @GetMapping
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lister les utilisateurs")
    @ApiResponse(responseCode = "200", description = "Liste paginée des utilisateurs")
    ResponseEntity<Page<BackOfficeUserDto>> getAll(
            @Parameter(description = "Page (0..N)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Filtre rôle") @RequestParam(required = false) String role,
            @Parameter(description = "Recherche") @RequestParam(required = false) String q
    );

    @GetMapping("/{id}")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Détail d'un utilisateur")
    ResponseEntity<BackOfficeUserDto> getById(
            @Parameter(description = "ID utilisateur", required = true) @PathVariable String id
    );

    @PutMapping("/{id}")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour un utilisateur")
    ResponseEntity<BackOfficeUserDto> update(
            @Parameter(description = "ID utilisateur", required = true) @PathVariable String id,
            @RequestBody BackOfficeUserDto dto
    );

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "Bearer Token")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un utilisateur")
    ResponseEntity<Void> delete(
            @Parameter(description = "ID utilisateur", required = true) @PathVariable String id
    );
}
