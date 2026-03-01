package com.lifeevent.lid.backoffice.category.controller;

import com.lifeevent.lid.backoffice.category.dto.BackOfficeCategoryDto;
import com.lifeevent.lid.backoffice.category.dto.BulkCategoryCreateRequest;
import com.lifeevent.lid.backoffice.category.dto.BulkCategoryDeleteRequest;
import com.lifeevent.lid.backoffice.category.dto.BulkCategoryResult;
import com.lifeevent.lid.backoffice.category.service.BackOfficeCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/backoffice/categories", "/api/backoffice/categories"})
@RequiredArgsConstructor
public class BackOfficeCategoryController implements IBackOfficeCategoryController {

    private final BackOfficeCategoryService backOfficeCategoryService;

    @Override
    public ResponseEntity<List<BackOfficeCategoryDto>> getAll() {
        return ResponseEntity.ok(backOfficeCategoryService.getAll());
    }

    @Override
    public ResponseEntity<BackOfficeCategoryDto> getById(Integer id) {
        return ResponseEntity.ok(backOfficeCategoryService.getById(id));
    }

    @Override
    public ResponseEntity<BackOfficeCategoryDto> create(@RequestBody BackOfficeCategoryDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeCategoryService.create(dto));
    }

    @Override
    public ResponseEntity<BackOfficeCategoryDto> update(Integer id, BackOfficeCategoryDto dto) {
        return ResponseEntity.ok(backOfficeCategoryService.update(id, dto));
    }

    @Override
    public ResponseEntity<Void> delete(Integer id) {
        backOfficeCategoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> deleteAll() {
        backOfficeCategoryService.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<BulkCategoryResult> bulkCreate(BulkCategoryCreateRequest request) {
        List<BackOfficeCategoryDto> categories = request != null ? request.getCategories() : List.of();
        return ResponseEntity.ok(backOfficeCategoryService.bulkCreate(categories));
    }

    @Override
    public ResponseEntity<Void> bulkDelete(BulkCategoryDeleteRequest request) {
        List<Integer> ids = request != null ? request.getIds() : List.of();
        backOfficeCategoryService.bulkDelete(ids);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> purge(boolean withProducts) {
        backOfficeCategoryService.purge(withProducts);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Object> uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("Fichier manquant.");
        }
        try {
            String original = file.getOriginalFilename();
            String ext = "";
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf("."));
            }
            String name = UUID.randomUUID() + ext;
            Path dir = Path.of(System.getProperty("java.io.tmpdir"), "lid-backoffice", "category-images");
            Files.createDirectories(dir);
            Path target = dir.resolve(name);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            String url = "/api/v1/backoffice/categories/image/" + name;
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(java.util.Map.of("url", url));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload impossible.");
        }
    }

    @Override
    public ResponseEntity<Resource> getImage(String filename) {
        try {
            Path dir = Path.of(System.getProperty("java.io.tmpdir"), "lid-backoffice", "category-images");
            Path file = dir.resolve(filename).normalize();
            if (!Files.exists(file) || !Files.isRegularFile(file)) {
                return ResponseEntity.notFound().build();
            }
            UrlResource resource = new UrlResource(file.toUri());
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_OCTET_STREAM).body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
