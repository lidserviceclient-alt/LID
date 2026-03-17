package com.lifeevent.lid.blog.controller;

import com.lifeevent.lid.blog.dto.BlogPostDto;
import com.lifeevent.lid.blog.entity.BlogPost;
import com.lifeevent.lid.blog.repository.BlogPostRepository;
import com.lifeevent.lid.cache.CatalogCacheNames;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/blog/posts", "/api/blog/posts"})
@RequiredArgsConstructor
public class BlogPostController {

    private final BlogPostRepository blogPostRepository;

    @GetMapping
    @Cacheable(cacheNames = CatalogCacheNames.BLOG_POSTS)
    public List<BlogPostDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);
        List<BlogPost> entities = blogPostRepository
                .findAll(PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "publishedAt")))
                .getContent();
        return entities.stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    @Cacheable(cacheNames = CatalogCacheNames.BLOG_POST_DETAILS, key = "#id")
    public BlogPostDto get(@PathVariable Long id) {
        BlogPost entity = blogPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlogPost", "id", id.toString()));
        return toDto(entity);
    }

    private BlogPostDto toDto(BlogPost entity) {
        return BlogPostDto.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .excerpt(entity.getExcerpt())
                .content(entity.getContent())
                .imageUrl(entity.getImageUrl())
                .featured(entity.getFeatured())
                .publishedAt(entity.getPublishedAt())
                .build();
    }
}
