package com.lifeevent.lid.backoffice.category.service;

import com.lifeevent.lid.backoffice.category.dto.BackOfficeCategoryDto;
import com.lifeevent.lid.backoffice.category.dto.BulkCategoryResult;

import java.util.List;

public interface BackOfficeCategoryService {
    List<BackOfficeCategoryDto> getAll();
    BackOfficeCategoryDto create(BackOfficeCategoryDto dto);
    BackOfficeCategoryDto update(Integer id, BackOfficeCategoryDto dto);
    void delete(Integer id);
    BulkCategoryResult bulkCreate(List<BackOfficeCategoryDto> dtos);
    void bulkDelete(List<Integer> ids);
    void purge(boolean withProducts);
}
