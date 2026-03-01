package com.lifeevent.lid.backoffice.blog.controller;

import com.lifeevent.lid.backoffice.blog.dto.BackOfficeBlogPostDto;
import com.lifeevent.lid.backoffice.blog.service.BackOfficeBlogPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/backoffice/blog-posts", "/api/backoffice/blog-posts"})
@RequiredArgsConstructor
public class BackOfficeBlogPostController implements IBackOfficeBlogPostController {

    private final BackOfficeBlogPostService backOfficeBlogPostService;

    @Override
    public ResponseEntity<List<BackOfficeBlogPostDto>> getAll() {
        return ResponseEntity.ok(backOfficeBlogPostService.getAll());
    }

    @Override
    public ResponseEntity<BackOfficeBlogPostDto> getById(Long id) {
        return ResponseEntity.ok(backOfficeBlogPostService.getById(id));
    }

    @Override
    public ResponseEntity<BackOfficeBlogPostDto> create(BackOfficeBlogPostDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeBlogPostService.create(dto));
    }

    @Override
    public ResponseEntity<BackOfficeBlogPostDto> update(Long id, BackOfficeBlogPostDto dto) {
        return ResponseEntity.ok(backOfficeBlogPostService.update(id, dto));
    }

    @Override
    public ResponseEntity<Void> delete(Long id) {
        backOfficeBlogPostService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
