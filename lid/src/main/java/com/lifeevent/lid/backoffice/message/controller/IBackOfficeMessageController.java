package com.lifeevent.lid.backoffice.message.controller;

import com.lifeevent.lid.backoffice.message.dto.BackOfficeMessageDto;
import com.lifeevent.lid.backoffice.message.dto.CreateBackOfficeMessageRequest;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "BackOffice - Messages", description = "API back-office pour les envois d'email")
public interface IBackOfficeMessageController {

    @GetMapping
    @ApiResponse(responseCode = "200", description = "Historique paginé des messages")
    ResponseEntity<Page<BackOfficeMessageDto>> getAll(
            @Parameter(description = "Page (0..N)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "20") int size
    );

    @PostMapping
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Message créé",
                    content = @Content(schema = @Schema(implementation = BackOfficeMessageDto.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<BackOfficeMessageDto> create(@RequestBody CreateBackOfficeMessageRequest request);

    @PostMapping("/{id}/retry")
    ResponseEntity<BackOfficeMessageDto> retry(
            @Parameter(description = "ID du message", required = true)
            @PathVariable Long id
    );

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(
            @Parameter(description = "ID du message", required = true)
            @PathVariable Long id
    );
}
