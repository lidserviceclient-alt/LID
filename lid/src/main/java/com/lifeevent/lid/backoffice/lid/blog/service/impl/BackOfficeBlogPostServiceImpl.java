package com.lifeevent.lid.backoffice.lid.blog.service.impl;

import com.lifeevent.lid.backoffice.lid.blog.dto.BackOfficeBlogPostDto;
import com.lifeevent.lid.backoffice.lid.blog.mapper.BackOfficeBlogPostMapper;
import com.lifeevent.lid.backoffice.lid.blog.service.BackOfficeBlogPostService;
import com.lifeevent.lid.blog.entity.BlogPost;
import com.lifeevent.lid.blog.repository.BlogPostRepository;
import com.lifeevent.lid.common.cache.event.BlogCatalogChangedEvent;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeBlogPostServiceImpl implements BackOfficeBlogPostService {

    private final BlogPostRepository blogPostRepository;
    private final BackOfficeBlogPostMapper backOfficeBlogPostMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<BackOfficeBlogPostDto> getAll(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);
        List<BlogPost> entities = blogPostRepository
                .findAll(PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "publishedAt")))
                .getContent();
        return backOfficeBlogPostMapper.toDtoList(entities);
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeBlogPostDto getById(Long id) {
        return backOfficeBlogPostMapper.toDto(findByIdOrThrow(id));
    }

    @Override
    public BackOfficeBlogPostDto create(BackOfficeBlogPostDto dto) {
        BlogPost entity = backOfficeBlogPostMapper.toEntity(dto);
        applyDefaults(entity);
        BlogPost saved = blogPostRepository.save(entity);
        eventPublisher.publishEvent(new BlogCatalogChangedEvent());
        return backOfficeBlogPostMapper.toDto(saved);
    }

    @Override
    public BackOfficeBlogPostDto update(Long id, BackOfficeBlogPostDto dto) {
        BlogPost entity = findByIdOrThrow(id);
        backOfficeBlogPostMapper.updateEntityFromDto(dto, entity);
        applyDefaults(entity);
        BlogPost saved = blogPostRepository.save(entity);
        eventPublisher.publishEvent(new BlogCatalogChangedEvent());
        return backOfficeBlogPostMapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!blogPostRepository.existsById(id)) {
            throw new ResourceNotFoundException("BlogPost", "id", id.toString());
        }
        blogPostRepository.deleteById(id);
        eventPublisher.publishEvent(new BlogCatalogChangedEvent());
    }

    private void applyDefaults(BlogPost entity) {
        if (entity.getFeatured() == null) {
            entity.setFeatured(Boolean.FALSE);
        }
        if (entity.getPublishedAt() == null) {
            entity.setPublishedAt(LocalDateTime.now());
        }
    }

    private BlogPost findByIdOrThrow(Long id) {
        return blogPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlogPost", "id", id.toString()));
    }
}
