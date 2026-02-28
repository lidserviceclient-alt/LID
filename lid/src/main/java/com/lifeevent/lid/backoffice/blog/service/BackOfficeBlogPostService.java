package com.lifeevent.lid.backoffice.blog.service;

import com.lifeevent.lid.backoffice.blog.dto.BackOfficeBlogPostDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeBlogPostService {
    Page<BackOfficeBlogPostDto> getAll(Pageable pageable);
    BackOfficeBlogPostDto create(BackOfficeBlogPostDto dto);
    BackOfficeBlogPostDto update(Long id, BackOfficeBlogPostDto dto);
    void delete(Long id);
}
