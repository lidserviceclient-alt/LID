package com.lifeevent.lid.backoffice.blog.service.impl;

import com.lifeevent.lid.backoffice.blog.dto.BackOfficeBlogPostDto;
import com.lifeevent.lid.backoffice.blog.mapper.BackOfficeBlogPostMapper;
import com.lifeevent.lid.backoffice.blog.service.BackOfficeBlogPostService;
import com.lifeevent.lid.blog.entity.BlogPost;
import com.lifeevent.lid.blog.repository.BlogPostRepository;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
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

    @Override
    @Transactional(readOnly = true)
    public List<BackOfficeBlogPostDto> getAll() {
        List<BlogPost> entities = blogPostRepository.findAll(Sort.by(Sort.Direction.DESC, "publishedAt"));
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
        return backOfficeBlogPostMapper.toDto(saved);
    }

    @Override
    public BackOfficeBlogPostDto update(Long id, BackOfficeBlogPostDto dto) {
        BlogPost entity = findByIdOrThrow(id);
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

    private BlogPost findByIdOrThrow(Long id) {
        return blogPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BlogPost", "id", id.toString()));
    }
}
