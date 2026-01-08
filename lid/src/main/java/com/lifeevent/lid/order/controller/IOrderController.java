package com.lifeevent.lid.order.controller;

import com.lifeevent.lid.order.dto.CheckoutRequestDto;
import com.lifeevent.lid.order.dto.CheckoutResponseDto;
import com.lifeevent.lid.order.dto.OrderDetailDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Tag(name = "Orders", description = "API pour la gestion des commandes")
@SecurityRequirement(name = "bearer-jwt")
public interface IOrderController {
    
    @Operation(summary = "Initier un checkout", description = "Crée une commande, réserve le stock et initie le processus de paiement")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Commande créée avec succès"),
        @ApiResponse(responseCode = "401", description = "Non autorisé"),
        @ApiResponse(responseCode = "400", description = "Requête invalide")
    })
    @PostMapping("/checkout")
    ResponseEntity<CheckoutResponseDto> checkout(
            @Parameter(description = "ID du client", example = "1", required = true)
            @RequestParam Integer customerId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Détails du checkout (articles à commander, adresse, etc)",
                required = true,
                content = @Content(schema = @Schema(implementation = CheckoutRequestDto.class))
            )
            @RequestBody CheckoutRequestDto request);
    
    @Operation(summary = "Récupérer les commandes du client", description = "Retourne la liste paginée des commandes d'un client")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Liste des commandes"),
        @ApiResponse(responseCode = "401", description = "Non autorisé")
    })
    @GetMapping("/orders")
    ResponseEntity<List<OrderDetailDto>> getCustomerOrders(
            @Parameter(description = "ID du client", example = "1", required = true)
            @RequestParam Integer customerId,
            @Parameter(description = "Numéro de page (commençant à 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre de commandes par page", example = "10")
            @RequestParam(defaultValue = "10") int size);
    
    @Operation(summary = "Récupérer les détails d'une commande", description = "Retourne les informations complètes d'une commande spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Détails de la commande"),
        @ApiResponse(responseCode = "404", description = "Commande non trouvée"),
        @ApiResponse(responseCode = "401", description = "Non autorisé")
    })
    @GetMapping("/orders/{id}")
    ResponseEntity<?> getOrderDetail(
            @Parameter(description = "ID de la commande", example = "1", required = true)
            @PathVariable Long id);
    
    @Operation(summary = "Suivi de la commande", description = "Retourne les informations de suivi incluant numéro de tracking et statut actuel")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Informations de suivi"),
        @ApiResponse(responseCode = "404", description = "Commande non trouvée"),
        @ApiResponse(responseCode = "401", description = "Non autorisé")
    })
    @GetMapping("/orders/{id}/tracking")
    ResponseEntity<?> getOrderTracking(
            @Parameter(description = "ID de la commande", example = "1", required = true)
            @PathVariable Long id);
}
