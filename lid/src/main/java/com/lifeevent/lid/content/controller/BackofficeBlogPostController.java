package com.lifeevent.lid.content.controller;

import com.lifeevent.lid.content.dto.BlogPostDto;
import com.lifeevent.lid.content.service.BlogPostService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/backoffice/blog-posts")
public class BackofficeBlogPostController {
    private final BlogPostService service;

    public BackofficeBlogPostController(BlogPostService service) {
        this.service = service;
    }

    @GetMapping
    public List<BlogPostDto> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public BlogPostDto get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping
    public BlogPostDto create(@RequestBody BlogPostDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public BlogPostDto update(@PathVariable String id, @RequestBody BlogPostDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
