package com.lifeevent.lid.backoffice.lid.category.service.impl;

import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.article.enumeration.CategoryLevel;
import com.lifeevent.lid.article.repository.CategoryRepository;
import com.lifeevent.lid.backoffice.lid.category.dto.BackOfficeCategoryDto;
import com.lifeevent.lid.backoffice.lid.category.dto.BulkCategoryResult;
import com.lifeevent.lid.backoffice.lid.category.dto.BulkCategoryResultItem;
import com.lifeevent.lid.backoffice.lid.category.mapper.BackOfficeCategoryMapper;
import com.lifeevent.lid.backoffice.lid.category.service.BackOfficeCategoryService;
import com.lifeevent.lid.common.cache.event.CategoryCatalogChangedEvent;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BackOfficeCategoryServiceImpl implements BackOfficeCategoryService {

    private final CategoryRepository categoryRepository;
    private final BackOfficeCategoryMapper backOfficeCategoryMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<BackOfficeCategoryDto> getAll() {
        return backOfficeCategoryMapper.toDtoList(categoryRepository.findAllByOrderByOrderIdxAsc()).stream()
                .map(this::withBusinessIdFallback)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeCategoryDto getById(Integer id) {
        return withBusinessIdFallback(backOfficeCategoryMapper.toDto(findCategoryOrThrow(id)));
    }

    @Override
    public BackOfficeCategoryDto create(BackOfficeCategoryDto dto) {
        Category entity = backOfficeCategoryMapper.toEntity(dto);
        applyDefaults(entity, dto);
        Category saved = categoryRepository.save(entity);
        eventPublisher.publishEvent(new CategoryCatalogChangedEvent());
        return withBusinessIdFallback(backOfficeCategoryMapper.toDto(saved));
    }

    @Override
    public BackOfficeCategoryDto update(Integer id, BackOfficeCategoryDto dto) {
        Category entity = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id.toString()));
        backOfficeCategoryMapper.updateEntityFromDto(dto, entity);
        applyDefaults(entity, dto);
        Category saved = categoryRepository.save(entity);
        eventPublisher.publishEvent(new CategoryCatalogChangedEvent());
        return withBusinessIdFallback(backOfficeCategoryMapper.toDto(saved));
    }

    @Override
    public void delete(Integer id) {
        Category entity = findCategoryOrThrow(id);
        deactivateAndSave(entity);
        eventPublisher.publishEvent(new CategoryCatalogChangedEvent());
    }

    @Override
    public void deleteAll() {
        deactivateAll();
        eventPublisher.publishEvent(new CategoryCatalogChangedEvent());
    }

    @Override
    public BulkCategoryResult bulkCreate(List<BackOfficeCategoryDto> dtos) {
        List<BulkCategoryResultItem> results = new ArrayList<>();
        int created = 0;
        int total = dtos == null ? 0 : dtos.size();
        if (dtos != null) {
            for (int i = 0; i < dtos.size(); i++) {
                BackOfficeCategoryDto dto = dtos.get(i);
                try {
                    create(dto);
                    created++;
                    results.add(BulkCategoryResultItem.builder()
                            .index(i)
                            .name(dto != null ? dto.getNom() : null)
                            .success(true)
                            .build());
                } catch (Exception e) {
                    log.warn("Bulk category create failed at index {}: {}", i, e.getMessage());
                    results.add(BulkCategoryResultItem.builder()
                            .index(i)
                            .name(dto != null ? dto.getNom() : null)
                            .success(false)
                            .errorMessage(e.getMessage())
                            .build());
                }
            }
        }
        BulkCategoryResult result = BulkCategoryResult.builder()
                .total(total)
                .created(created)
                .results(results)
                .build();
        if (created > 0) {
            eventPublisher.publishEvent(new CategoryCatalogChangedEvent());
        }
        return result;
    }

    @Override
    public void bulkDelete(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) return;
        deactivateAllByIds(ids);
        eventPublisher.publishEvent(new CategoryCatalogChangedEvent());
    }

    @Override
    public void purge(boolean withProducts) {
        // NOTE: withProducts reserved for future behavior; current purge = désactivation globale.
        deactivateAll();
        eventPublisher.publishEvent(new CategoryCatalogChangedEvent());
    }

    private Category findCategoryOrThrow(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id.toString()));
    }

    private void deactivateAndSave(Category entity) {
        if (entity == null) return;
        entity.setIsActivated(Boolean.FALSE);
        categoryRepository.save(entity);
    }

    private void deactivateAllByIds(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        categoryRepository.deactivateAllByIds(ids);
    }

    private void deactivateAll() {
        categoryRepository.deactivateAllActivated();
    }

    private void applyDefaults(Category entity, BackOfficeCategoryDto dto) {
        if (entity.getLevel() == null) {
            entity.setLevel(CategoryLevel.PRINCIPALE);
        }
        if (entity.getIsActivated() == null) {
            entity.setIsActivated(Boolean.TRUE);
        }
        if (entity.getOrderIdx() == null) {
            entity.setOrderIdx(0);
        }
        if ((entity.getSlug() == null || entity.getSlug().trim().isEmpty())
                && dto != null && dto.getNom() != null && !dto.getNom().trim().isEmpty()) {
            entity.setSlug(slugify(dto.getNom()));
        }
        if ((entity.getBusinessId() == null || entity.getBusinessId().trim().isEmpty())) {
            String candidate = dto != null ? dto.getBusinessId() : null;
            if (candidate == null || candidate.trim().isEmpty()) {
                candidate = entity.getSlug();
            }
            if (candidate == null || candidate.trim().isEmpty()) {
                candidate = dto != null ? slugify(dto.getNom()) : null;
            }
            entity.setBusinessId(candidate == null ? null : candidate.trim());
        }
    }

    private String slugify(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = normalized.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "")
                .replaceAll("-{2,}", "-");
        return slug.isEmpty() ? null : slug;
    }

    private BackOfficeCategoryDto withBusinessIdFallback(BackOfficeCategoryDto dto) {
        if (dto == null) {
            return null;
        }
        if (dto.getBusinessId() == null || dto.getBusinessId().trim().isEmpty()) {
            dto.setBusinessId(dto.getSlug());
        }
        return dto;
    }
}
