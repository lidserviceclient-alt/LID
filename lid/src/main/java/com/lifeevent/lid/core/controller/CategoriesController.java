package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.BulkCreateCategoriesRequest;
import com.lifeevent.lid.core.dto.BulkCreateCategoriesResponse;
import com.lifeevent.lid.core.dto.BulkCreateCategoryResultDto;
import com.lifeevent.lid.core.dto.BulkDeleteCategoriesRequest;
import com.lifeevent.lid.core.dto.BulkDeleteCategoriesResponse;
import com.lifeevent.lid.core.dto.CategoryDto;
import com.lifeevent.lid.core.dto.CategoryImageUploadResponse;
import com.lifeevent.lid.core.dto.PurgeCatalogResponse;
import com.lifeevent.lid.core.dto.UpsertCategoryRequest;
import com.lifeevent.lid.core.service.CategoryImageStorageService;
import com.lifeevent.lid.core.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/backoffice/categories")
public class CategoriesController {

    private final CategoryService categoryService;
    private final CategoryImageStorageService categoryImageStorageService;

    public CategoriesController(CategoryService categoryService, CategoryImageStorageService categoryImageStorageService) {
        this.categoryService = categoryService;
        this.categoryImageStorageService = categoryImageStorageService;
    }

    @GetMapping({ "", "/" })
    public List<CategoryDto> listCategories() {
        return categoryService.listAll();
    }

    @GetMapping("/{id}")
    public CategoryDto getCategory(@PathVariable String id) {
        return categoryService.getById(id);
    }

    @PostMapping
    public CategoryDto createCategory(@Valid @RequestBody UpsertCategoryRequest request) {
        return categoryService.create(request);
    }

    @PostMapping("/bulk")
    public BulkCreateCategoriesResponse bulkCreate(@Valid @RequestBody BulkCreateCategoriesRequest request) {
        List<UpsertCategoryRequest> categories = request.categories();
        List<BulkCreateCategoryResultDto> results = new ArrayList<>();
        int created = 0;
        for (int i = 0; i < categories.size(); i++) {
            UpsertCategoryRequest item = categories.get(i);
            try {
                CategoryDto dto = categoryService.create(item);
                created++;
                results.add(new BulkCreateCategoryResultDto(i, item.getNom(), true, dto.id(), null));
            } catch (Exception ex) {
                String msg = ex.getMessage() != null ? ex.getMessage() : "Erreur inconnue";
                results.add(new BulkCreateCategoryResultDto(i, item.getNom(), false, null, msg));
            }
        }
        return new BulkCreateCategoriesResponse(categories.size(), created, results);
    }

    @PutMapping("/{id}")
    public CategoryDto updateCategory(
            @PathVariable String id,
            @Valid @RequestBody UpsertCategoryRequest request
    ) {
        return categoryService.update(id, request);
    }

    @PostMapping("/bulk-delete")
    public BulkDeleteCategoriesResponse bulkDelete(@Valid @RequestBody BulkDeleteCategoriesRequest request) {
        return categoryService.deactivateBulk(request.ids());
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CategoryImageUploadResponse uploadImage(@RequestParam("file") MultipartFile file) {
        String url = categoryImageStorageService.storeCategoryImage(file);
        return new CategoryImageUploadResponse(url);
    }

    @PostMapping("/purge")
    public PurgeCatalogResponse purgeAll(@RequestParam(name = "withProducts", defaultValue = "false") boolean withProducts) {
        return categoryService.purgeAll(withProducts);
    }

    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable String id) {
        categoryService.delete(id);
    }

    @DeleteMapping({ "", "/" })
    public void deleteCategoryMissingId() {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Id de catégorie requis.");
    }
}
