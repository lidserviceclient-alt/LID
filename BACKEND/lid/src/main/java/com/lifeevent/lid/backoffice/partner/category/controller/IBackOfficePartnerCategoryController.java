package com.lifeevent.lid.backoffice.partner.category.controller;

import com.lifeevent.lid.backoffice.partner.category.dto.PartnerSubCategoryDto;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "BackOffice - Partner Categories", description = "CRUD sous-catégories pour le partner connecté")
@SecurityRequirement(name = "Bearer Token")
public interface IBackOfficePartnerCategoryController {

    @GetMapping
    ResponseEntity<List<PartnerSubCategoryDto>> listMine();

    @PostMapping
    ResponseEntity<PartnerSubCategoryDto> createMine(@RequestBody PartnerSubCategoryDto dto);

    @GetMapping("/{id}")
    ResponseEntity<PartnerSubCategoryDto> getMine(@PathVariable Long id);

    @PutMapping("/{id}")
    ResponseEntity<PartnerSubCategoryDto> updateMine(@PathVariable Long id, @RequestBody PartnerSubCategoryDto dto);

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteMine(@PathVariable Long id);
}

