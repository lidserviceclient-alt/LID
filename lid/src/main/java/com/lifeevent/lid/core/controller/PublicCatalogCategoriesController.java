package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.CategoryDto;
import com.lifeevent.lid.core.service.CategoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog/categories")
public class PublicCatalogCategoriesController {

    private final CategoryService categoryService;

    public PublicCatalogCategoriesController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryDto> listCategories() {
        return categoryService.listActive();
    }

    @GetMapping("/featured")
    public List<CategoryDto> listFeaturedCategories(
            @RequestParam(value = "limit", required = false) Integer limit
    ) {
        return categoryService.listFeaturedActive(limit);
    }
}
