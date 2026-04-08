package com.lifeevent.lid.common.controller;

import com.lifeevent.lid.common.dto.BulkFileUploadResponseDto;
import com.lifeevent.lid.common.dto.FileUploadResponseDto;
import com.lifeevent.lid.common.media.dto.MediaAssetDto;
import com.lifeevent.lid.common.media.enumeration.MediaOwnerScope;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Storage", description = "API générique de stockage de fichiers")
public interface IFileStorageController {

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    //@SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Uploader un fichier")
    ResponseEntity<FileUploadResponseDto> upload(
            @RequestPart("file") MultipartFile file,
            @Parameter(description = "Dossier cible", example = "partners") @RequestParam(value = "folder", required = false) String folder,
            @Parameter(description = "Scope propriétaire", example = "LID") @RequestParam(value = "ownerScope", required = false) MediaOwnerScope ownerScope,
            @Parameter(description = "Propriétaire partenaire", example = "partner-user-id") @RequestParam(value = "ownerUserId", required = false) String ownerUserId,
            @Parameter(description = "Remplacer un média portant déjà le même nom") @RequestParam(value = "overwrite", defaultValue = "false") boolean overwrite,
            HttpServletRequest request
    );

    @PostMapping(value = "/upload-bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Uploader plusieurs images")
    ResponseEntity<BulkFileUploadResponseDto> uploadBulk(
            @RequestPart("files") MultipartFile[] files,
            @Parameter(description = "Dossier cible", example = "products") @RequestParam(value = "folder", required = false) String folder,
            @Parameter(description = "Scope propriétaire", example = "LID") @RequestParam(value = "ownerScope", required = false) MediaOwnerScope ownerScope,
            @Parameter(description = "Propriétaire partenaire", example = "partner-user-id") @RequestParam(value = "ownerUserId", required = false) String ownerUserId,
            @Parameter(description = "Remplacer les médias portant déjà le même nom") @RequestParam(value = "overwrite", defaultValue = "false") boolean overwrite,
            HttpServletRequest request
    );

    @GetMapping("/media")
    @Operation(summary = "Lister les médias uploadés")
    ResponseEntity<Page<MediaAssetDto>> listMedia(
            @RequestParam(value = "ownerScope", required = false) MediaOwnerScope ownerScope,
            @RequestParam(value = "ownerUserId", required = false) String ownerUserId,
            @RequestParam(value = "folder", required = false) String folder,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "24") int size
    );

    @DeleteMapping("/delete")
    //@SecurityRequirement(name = "Bearer Token")
    @Operation(summary = "Supprimer un fichier")
    ResponseEntity<Void> delete(@RequestParam("objectKey") String objectKey);
}
