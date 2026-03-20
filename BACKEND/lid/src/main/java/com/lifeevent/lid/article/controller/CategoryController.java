package com.lifeevent.lid.article.controller;

import com.lifeevent.lid.article.dto.CategoryDto;
import com.lifeevent.lid.article.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

//@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController implements ICategoryController {
    
    private final CategoryService categoryService;
    
    @Override
    public ResponseEntity<CategoryDto> createCategory(@RequestBody CategoryDto dto) {
        CategoryDto created = categoryService.createCategory(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @Override
    public ResponseEntity<CategoryDto> getCategory(@PathVariable Integer id) {
        Optional<CategoryDto> category = categoryService.getCategoryById(id);
        return category.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @Override
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        List<CategoryDto> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }
    
    @Override
    public ResponseEntity<CategoryDto> getCategoryByName(@PathVariable String name) {
        Optional<CategoryDto> category = categoryService.getCategoryByName(name);
        return category.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @Override
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable Integer id,
            @RequestBody CategoryDto dto) {
        CategoryDto updated = categoryService.updateCategory(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @Override
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
