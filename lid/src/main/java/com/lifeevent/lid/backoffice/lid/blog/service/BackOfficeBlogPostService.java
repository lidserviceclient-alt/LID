package com.lifeevent.lid.backoffice.lid.blog.service;

import com.lifeevent.lid.backoffice.lid.blog.dto.BackOfficeBlogPostDto;

import java.util.List;

public interface BackOfficeBlogPostService {
    List<BackOfficeBlogPostDto> getAll(int page, int size);
    BackOfficeBlogPostDto getById(Long id);
    BackOfficeBlogPostDto create(BackOfficeBlogPostDto dto);
    BackOfficeBlogPostDto update(Long id, BackOfficeBlogPostDto dto);
    void delete(Long id);
}
