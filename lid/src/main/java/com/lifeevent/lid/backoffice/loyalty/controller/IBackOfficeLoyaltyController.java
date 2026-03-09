package com.lifeevent.lid.backoffice.loyalty.controller;

import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyAdjustPointsRequest;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyCollectionDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyConfigDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyCustomerDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyOverviewDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyTierDto;
import com.lifeevent.lid.backoffice.loyalty.dto.BackOfficeLoyaltyTransactionDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
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

@Tag(name = "BackOffice - Loyalty", description = "API back-office pour la fidélité")
public interface IBackOfficeLoyaltyController {

    @GetMapping("/collection")
    ResponseEntity<BackOfficeLoyaltyCollectionDto> getCollection(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer topLimit
    );

    @GetMapping("/overview")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Vue d'ensemble fidélité")
    ResponseEntity<BackOfficeLoyaltyOverviewDto> getOverview();

    @GetMapping("/tiers")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Lister les niveaux de fidélité")
    ResponseEntity<List<BackOfficeLoyaltyTierDto>> getTiers();

    @PostMapping("/tiers")
    ResponseEntity<BackOfficeLoyaltyTierDto> createTier(@Valid @RequestBody BackOfficeLoyaltyTierDto dto);

    @GetMapping("/config")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Récupérer la configuration fidélité")
    ResponseEntity<BackOfficeLoyaltyConfigDto> getConfig();

    @PutMapping("/config")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Mettre à jour la configuration fidélité")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Configuration mise à jour",
                    content = @Content(schema = @Schema(implementation = BackOfficeLoyaltyConfigDto.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<BackOfficeLoyaltyConfigDto> updateConfig(@RequestBody BackOfficeLoyaltyConfigDto dto);

    @PutMapping("/tiers/{id}")
    // (name = "Bearer Token")    // ("hasRole('ADMIN')")    @Operation(summary = "Mettre à jour un niveau de fidélité")
    ResponseEntity<BackOfficeLoyaltyTierDto> updateTier(
            @Parameter(description = "ID du niveau", required = true)
            @PathVariable Long id,
            @RequestBody BackOfficeLoyaltyTierDto dto
    );

    @DeleteMapping("/tiers/{id}")
    ResponseEntity<Void> deleteTier(@PathVariable Long id);

    @GetMapping("/customers")
    ResponseEntity<Page<BackOfficeLoyaltyCustomerDto>> getCustomers(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer limit
    );

    @GetMapping("/customers/{userId}")
    ResponseEntity<BackOfficeLoyaltyCustomerDto> getCustomer(@PathVariable String userId);

    @GetMapping("/customers/{userId}/transactions")
    ResponseEntity<Page<BackOfficeLoyaltyTransactionDto>> getTransactions(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @PostMapping("/customers/{userId}/adjust")
    ResponseEntity<BackOfficeLoyaltyCustomerDto> adjustPoints(
            @PathVariable String userId,
            @Valid @RequestBody BackOfficeLoyaltyAdjustPointsRequest request
    );
}
