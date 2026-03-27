package com.lifeevent.lid.backoffice.lid.order.controller;

import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeCreateOrderRequest;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeOrderCreateBootstrapDto;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeOrderQuoteResponse;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeOrderSummaryDto;
import com.lifeevent.lid.backoffice.lid.order.enumeration.BackOfficeOrderStatus;
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

import java.util.List;

@Tag(name = "BackOffice - Orders", description = "API back-office pour gérer les commandes")
public interface IBackOfficeOrderController {

    @GetMapping("/create-bootstrap")
    ResponseEntity<BackOfficeOrderCreateBootstrapDto> getCreateBootstrap(
            @RequestParam(defaultValue = "0") int customersPage,
            @RequestParam(defaultValue = "20") int customersSize,
            @RequestParam(defaultValue = "0") int productsPage,
            @RequestParam(defaultValue = "20") int productsSize
    );

    @GetMapping
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Lister les commandes")
    @ApiResponse(responseCode = "200", description = "Liste paginée des commandes")
    ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeOrderSummaryDto>> getOrders(
            @Parameter(description = "Page (0..N)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Statut") @RequestParam(required = false) BackOfficeOrderStatus status,
            @Parameter(description = "Recherche") @RequestParam(required = false) String q
    );

    @GetMapping("/recent")
    ResponseEntity<List<BackOfficeOrderSummaryDto>> getRecentOrders();

    @GetMapping("/customers/orders")
    @ApiResponse(responseCode = "200", description = "Liste paginée des commandes tous clients")
    ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeOrderSummaryDto>> getAllCustomersOrders(
            @Parameter(description = "Page (0..N)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Statut") @RequestParam(required = false) BackOfficeOrderStatus status,
            @Parameter(description = "Recherche") @RequestParam(required = false) String q
    );

    @GetMapping("/customers/{customerId}/orders")
    @ApiResponse(responseCode = "200", description = "Liste paginée des commandes d'un client")
    ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeOrderSummaryDto>> getOrdersByCustomer(
            @Parameter(description = "ID client", required = true) @PathVariable String customerId,
            @Parameter(description = "Page (0..N)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Statut") @RequestParam(required = false) BackOfficeOrderStatus status
    );

    @PostMapping
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Créer une commande")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Commande créée",
                    content = @Content(schema = @Schema(implementation = BackOfficeOrderSummaryDto.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<BackOfficeOrderSummaryDto> createOrder(@RequestBody BackOfficeCreateOrderRequest request);

    @PutMapping("/{id}/status")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Mettre à jour le statut d'une commande")
    ResponseEntity<BackOfficeOrderSummaryDto> updateStatus(
            @Parameter(description = "ID de la commande", required = true)
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload
    );

    @PostMapping("/quote")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Simuler une commande (quote)")
    ResponseEntity<BackOfficeOrderQuoteResponse> quote(@RequestBody BackOfficeCreateOrderRequest request);
}
