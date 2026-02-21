package com.lifeevent.lid.content.service;

import com.lifeevent.lid.content.dto.BlogPostDto;
import com.lifeevent.lid.content.entity.BlogPost;
import com.lifeevent.lid.content.repository.BlogPostRepository;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BlogPostService {
    private final BlogPostRepository repository;

    public BlogPostService(BlogPostRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<BlogPostDto> list() {
        return repository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public BlogPostDto get(String id) {
        BlogPost post = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlogPost", "id", id));
        return toDto(post);
    }

    @Transactional
    public BlogPostDto create(BlogPostDto dto) {
        BlogPost post = new BlogPost();
        apply(dto, post);
        return toDto(repository.save(post));
    }

    @Transactional
    public BlogPostDto update(String id, BlogPostDto dto) {
        BlogPost post = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlogPost", "id", id));
        apply(dto, post);
        return toDto(repository.save(post));
    }

    @Transactional
    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("BlogPost", "id", id);
        }
        repository.deleteById(id);
    }

    private void apply(BlogPostDto dto, BlogPost post) {
        post.setTitle(dto.getTitle());
        post.setExcerpt(dto.getExcerpt());
        post.setContent(dto.getContent());
        post.setImageUrl(dto.getImageUrl());
        post.setCategory(dto.getCategory());
        post.setDate(dto.getDate());
        post.setAuthor(dto.getAuthor());
        post.setFeatured(dto.getFeatured());
        post.setReadTime(dto.getReadTime());
    }

    private BlogPostDto toDto(BlogPost post) {
        return BlogPostDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .excerpt(post.getExcerpt())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .category(post.getCategory())
                .date(post.getDate())
                .author(post.getAuthor())
                .featured(post.getFeatured())
                .readTime(post.getReadTime())
                .build();
    }
}
