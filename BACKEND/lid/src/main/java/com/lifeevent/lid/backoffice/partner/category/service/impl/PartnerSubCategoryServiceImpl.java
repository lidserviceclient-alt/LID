package com.lifeevent.lid.backoffice.partner.category.service.impl;

import com.lifeevent.lid.backoffice.partner.category.dto.PartnerSubCategoryDto;
import com.lifeevent.lid.backoffice.partner.category.entity.PartnerSubCategory;
import com.lifeevent.lid.backoffice.partner.category.repository.PartnerSubCategoryRepository;
import com.lifeevent.lid.backoffice.partner.category.service.PartnerSubCategoryService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
@Transactional
@RequiredArgsConstructor
public class PartnerSubCategoryServiceImpl implements PartnerSubCategoryService {

    private final PartnerSubCategoryRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<PartnerSubCategoryDto> listMine() {
        String partnerId = requireCurrentPartnerId();
        return repository.findByPartnerIdOrderByCreatedAtDesc(partnerId).stream().map(this::toDto).toList();
    }

    @Override
    public PartnerSubCategoryDto createMine(PartnerSubCategoryDto dto) {
        String partnerId = requireCurrentPartnerId();
        PartnerSubCategory entity = PartnerSubCategory.builder()
                .partnerId(partnerId)
                .mainCategoryId(dto != null ? dto.getMainCategoryId() : null)
                .name(dto != null ? dto.getName() : null)
                .description(dto != null ? dto.getDescription() : null)
                .build();
        PartnerSubCategory saved = repository.save(entity);
        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PartnerSubCategoryDto getMine(Long id) {
        return toDto(findOwnedOrThrow(id));
    }

    @Override
    public PartnerSubCategoryDto updateMine(Long id, PartnerSubCategoryDto dto) {
        PartnerSubCategory entity = findOwnedOrThrow(id);
        if (dto != null) {
            if (dto.getMainCategoryId() != null) entity.setMainCategoryId(dto.getMainCategoryId());
            if (dto.getName() != null) entity.setName(dto.getName());
            entity.setDescription(dto.getDescription());
        }
        PartnerSubCategory saved = repository.save(entity);
        return toDto(saved);
    }

    @Override
    public void deleteMine(Long id) {
        PartnerSubCategory entity = findOwnedOrThrow(id);
        repository.delete(entity);
    }

    private PartnerSubCategory findOwnedOrThrow(Long id) {
        String partnerId = requireCurrentPartnerId();
        return repository.findByIdAndPartnerId(id, partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("PartnerSubCategory", "id", id == null ? "" : String.valueOf(id)));
    }

    private PartnerSubCategoryDto toDto(PartnerSubCategory entity) {
        if (entity == null) return null;
        return PartnerSubCategoryDto.builder()
                .id(entity.getId())
                .mainCategoryId(entity.getMainCategoryId())
                .name(entity.getName())
                .description(entity.getDescription())
                .productCount(0)
                .build();
    }

    private String requireCurrentPartnerId() {
        String userId = SecurityUtils.getCurrentUserId();
        if (userId == null || userId.isBlank() || "anonymousUser".equalsIgnoreCase(userId)) {
            throw new ResponseStatusException(UNAUTHORIZED);
        }
        return userId;
    }
}

