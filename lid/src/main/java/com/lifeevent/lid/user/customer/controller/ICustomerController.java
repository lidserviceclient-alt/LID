package com.lifeevent.lid.user.customer.controller;

import com.lifeevent.lid.user.customer.dto.CustomerDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Interface documentant les endpoints Customer pour Swagger
 */
@Tag(name = "Clients", description = "API pour gérer les clients de la plateforme")
@SecurityRequirement(name = "Bearer Token")
public interface ICustomerController {
    
    @PostMapping
    @Operation(summary = "Créer un nouveau client", description = "Crée un nouveau profil client dans la plateforme")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Client créé avec succès",
            content = @Content(schema = @Schema(implementation = CustomerDto.class))),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "409", description = "Email déjà existant")
    })
    ResponseEntity<CustomerDto> createCustomer(@RequestBody CustomerDto dto);
    
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un client par ID", description = "Récupère les détails d'un client spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Client trouvé",
            content = @Content(schema = @Schema(implementation = CustomerDto.class))),
        @ApiResponse(responseCode = "404", description = "Client non trouvé")
    })
    ResponseEntity<CustomerDto> getCustomer(
            @Parameter(description = "ID du client", required = true) @PathVariable String id);
    
    @GetMapping
    @Operation(summary = "Lister tous les clients", description = "Récupère la liste complète de tous les clients")
    @ApiResponse(responseCode = "200", description = "Liste des clients")
    ResponseEntity<List<CustomerDto>> getAllCustomers();
    
    @GetMapping("/email/{email}")
    @Operation(summary = "Récupérer un client par email", description = "Récupère un client à partir de son adresse email")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Client trouvé"),
        @ApiResponse(responseCode = "404", description = "Client non trouvé")
    })
    ResponseEntity<CustomerDto> getCustomerByEmail(
            @Parameter(description = "Email du client", required = true) @PathVariable String email);

    
    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un client", description = "Met à jour les informations d'un client existant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Client mis à jour avec succès"),
        @ApiResponse(responseCode = "404", description = "Client non trouvé"),
        @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<CustomerDto> updateCustomer(
            @Parameter(description = "ID du client", required = true) @PathVariable String id,
            @RequestBody CustomerDto dto);
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un client", description = "Supprime un client de la plateforme")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Client supprimé avec succès"),
        @ApiResponse(responseCode = "404", description = "Client non trouvé")
    })
    ResponseEntity<Void> deleteCustomer(
            @Parameter(description = "ID du client", required = true) @PathVariable String id);
    
    @GetMapping("/check-email/{email}")
    @Operation(summary = "Vérifier l'existence d'un email", description = "Vérifie si un email est déjà enregistré")
    @ApiResponse(responseCode = "200", description = "Résultat de la vérification")
    ResponseEntity<Boolean> emailExists(
            @Parameter(description = "Email à vérifier", required = true) @PathVariable String email);

}
