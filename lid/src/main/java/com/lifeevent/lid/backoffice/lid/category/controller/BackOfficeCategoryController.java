package com.lifeevent.lid.backoffice.lid.category.controller;

import com.lifeevent.lid.backoffice.lid.category.dto.BackOfficeCategoryDto;
import com.lifeevent.lid.backoffice.lid.category.dto.BulkCategoryCreateRequest;
import com.lifeevent.lid.backoffice.lid.category.dto.BulkCategoryDeleteRequest;
import com.lifeevent.lid.backoffice.lid.category.dto.BulkCategoryResult;
import com.lifeevent.lid.backoffice.lid.category.service.BackOfficeCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/backoffice/categories")
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
}
