package com.lifeevent.lid.backoffice.lid.category.service;

import com.lifeevent.lid.backoffice.lid.category.dto.BackOfficeCategoryDto;
import com.lifeevent.lid.backoffice.lid.category.dto.BulkCategoryResult;

import java.util.List;

public interface BackOfficeCategoryService {
    List<BackOfficeCategoryDto> getAll();
    BackOfficeCategoryDto getById(Integer id);
    BackOfficeCategoryDto create(BackOfficeCategoryDto dto);
    BackOfficeCategoryDto update(Integer id, BackOfficeCategoryDto dto);
    void delete(Integer id);
    void deleteAll();
    BulkCategoryResult bulkCreate(List<BackOfficeCategoryDto> dtos);
    void bulkDelete(List<Integer> ids);
    void purge(boolean withProducts);
}
