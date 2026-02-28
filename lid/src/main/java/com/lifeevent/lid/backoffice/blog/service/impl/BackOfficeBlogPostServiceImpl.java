package com.lifeevent.lid.backoffice.blog.service.impl;

import com.lifeevent.lid.backoffice.blog.dto.BackOfficeBlogPostDto;
import com.lifeevent.lid.backoffice.blog.mapper.BackOfficeBlogPostMapper;
import com.lifeevent.lid.backoffice.blog.service.BackOfficeBlogPostService;
import com.lifeevent.lid.blog.entity.BlogPost;
import com.lifeevent.lid.blog.repository.BlogPostRepository;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeBlogPostServiceImpl implements BackOfficeBlogPostService {

    private final BlogPostRepository blogPostRepository;
    private final BackOfficeBlogPostMapper backOfficeBlogPostMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeBlogPostDto> getAll(Pageable pageable) {
        return blogPostRepository.findAll(pageable).map(backOfficeBlogPostMapper::toDto);
    }

    @Override
    public BackOfficeBlogPostDto create(BackOfficeBlogPostDto dto) {
        BlogPost entity = backOfficeBlogPostMapper.toEntity(dto);
        applyDefaults(entity);
        BlogPost saved = blogPostRepository.save(entity);
        return backOfficeBlogPostMapper.toDto(saved);
    }

    @Override
    public BackOfficeBlogPostDto update(Long id, BackOfficeBlogPostDto dto) {
        BlogPost entity = blogPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlogPost", "id", id.toString()));
        backOfficeBlogPostMapper.updateEntityFromDto(dto, entity);
        applyDefaults(entity);
        BlogPost saved = blogPostRepository.save(entity);
        return backOfficeBlogPostMapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!blogPostRepository.existsById(id)) {
            throw new ResourceNotFoundException("BlogPost", "id", id.toString());
        }
        blogPostRepository.deleteById(id);
    }

    private void applyDefaults(BlogPost entity) {
        if (entity.getFeatured() == null) {
            entity.setFeatured(Boolean.FALSE);
        }
        if (entity.getPublishedAt() == null) {
            entity.setPublishedAt(LocalDateTime.now());
        }
    }
}
