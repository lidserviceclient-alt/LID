package com.lifeevent.lid.content.controller;

import com.lifeevent.lid.content.dto.BlogPostDto;
import com.lifeevent.lid.content.service.BlogPostService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/blog/posts")
public class BlogPostController {
    private final BlogPostService service;

    public BlogPostController(BlogPostService service) {
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
}
