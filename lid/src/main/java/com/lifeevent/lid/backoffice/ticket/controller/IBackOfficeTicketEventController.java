package com.lifeevent.lid.backoffice.ticket.controller;

import com.lifeevent.lid.backoffice.ticket.dto.BackOfficeTicketEventDto;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "BackOffice - Tickets", description = "API back-office pour gérer les évènements billetterie")
public interface IBackOfficeTicketEventController {

    @GetMapping
    @ApiResponse(responseCode = "200", description = "Liste des évènements")
    ResponseEntity<Page<BackOfficeTicketEventDto>> getAll(
            @Parameter(description = "Page (0..N)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page") @RequestParam(defaultValue = "20") int size
    );

    @PostMapping
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Évènement créé",
                    content = @Content(schema = @Schema(implementation = BackOfficeTicketEventDto.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<BackOfficeTicketEventDto> create(@RequestBody BackOfficeTicketEventDto dto);

    @PutMapping("/{id}")
    ResponseEntity<BackOfficeTicketEventDto> update(
            @Parameter(description = "ID de l'évènement", required = true)
            @PathVariable Long id,
            @RequestBody BackOfficeTicketEventDto dto
    );

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(
            @Parameter(description = "ID de l'évènement", required = true)
            @PathVariable Long id
    );
}
