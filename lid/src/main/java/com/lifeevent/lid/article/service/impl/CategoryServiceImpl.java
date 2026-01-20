package com.lifeevent.lid.article.service.impl;

import com.lifeevent.lid.article.dto.CategoryDto;
import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.article.mapper.CategoryMapper;
import com.lifeevent.lid.article.repository.CategoryRepository;
import com.lifeevent.lid.article.service.CategoryService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {
    
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    
    @Override
    public CategoryDto createCategory(CategoryDto dto) {
        log.info("Création d'une nouvelle catégorie: {}", dto.getName());
        Category category = categoryMapper.toEntity(dto);
        Category saved = categoryRepository.save(category);
        return categoryMapper.toDto(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<CategoryDto> getCategoryById(Integer id) {
        return categoryRepository.findById(id).map(categoryMapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> getAllCategories() {
        return categoryMapper.toDtoList(categoryRepository.findAllByOrderByOrderIdxAsc());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<CategoryDto> getCategoryByName(String name) {
        return categoryRepository.findByNameIgnoreCase(name)
            .map(categoryMapper::toDto);
    }
    
    @Override
    public CategoryDto updateCategory(Integer id, CategoryDto dto) {
        log.info("Mise à jour de la catégorie: {}", id);
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id.toString()));
        
        categoryMapper.updateEntityFromDto(dto, category);
        Category updated = categoryRepository.save(category);
        return categoryMapper.toDto(updated);
    }
    
    @Override
    public void deleteCategory(Integer id) {
        log.info("Suppression de la catégorie: {}", id);
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category", "id", id.toString());
        }
        categoryRepository.deleteById(id);
    }
}
