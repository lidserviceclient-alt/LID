package com.lifeevent.lid.common.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Tag(name = "Storage", description = "API générique de stockage de fichiers")
public interface IFileStorageController {

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    //@SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Uploader un fichier")
    ResponseEntity<Map<String, String>> upload(
            @RequestPart("file") MultipartFile file,
            @Parameter(description = "Dossier cible", example = "partners") @RequestParam(value = "folder", required = false) String folder
    );

    @DeleteMapping("/delete")
    //@SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Supprimer un fichier")
    ResponseEntity<Void> delete(@RequestParam("objectKey") String objectKey);
}
