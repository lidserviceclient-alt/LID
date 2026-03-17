package com.lifeevent.lid.backoffice.lid.blog.controller;

import com.lifeevent.lid.backoffice.lid.blog.dto.BackOfficeBlogPostDto;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "BackOffice - Blog", description = "API back-office pour gérer les articles du blog")
public interface IBackOfficeBlogPostController {

    @GetMapping
    @ApiResponse(responseCode = "200", description = "Liste des articles blog")
    ResponseEntity<List<BackOfficeBlogPostDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    );

    @GetMapping("/{id}")
    ResponseEntity<BackOfficeBlogPostDto> getById(
            @Parameter(description = "ID de l'article blog", required = true)
            @PathVariable Long id
    );

    @PostMapping
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Article blog créé",
                    content = @Content(schema = @Schema(implementation = BackOfficeBlogPostDto.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    ResponseEntity<BackOfficeBlogPostDto> create(@RequestBody BackOfficeBlogPostDto dto);

    @PutMapping("/{id}")
    ResponseEntity<BackOfficeBlogPostDto> update(
            @Parameter(description = "ID de l'article blog", required = true)
            @PathVariable Long id,
            @RequestBody BackOfficeBlogPostDto dto
    );

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(
            @Parameter(description = "ID de l'article blog", required = true)
            @PathVariable Long id
    );
}
