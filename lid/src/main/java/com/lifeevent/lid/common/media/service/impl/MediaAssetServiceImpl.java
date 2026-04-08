package com.lifeevent.lid.common.media.service.impl;

import com.lifeevent.lid.common.dto.BulkFileUploadResponseDto;
import com.lifeevent.lid.common.dto.FileUploadResponseDto;
import com.lifeevent.lid.common.dto.FileUploadResultDto;
import com.lifeevent.lid.common.dto.ProcessedImageFile;
import com.lifeevent.lid.common.media.dto.MediaAssetDto;
import com.lifeevent.lid.common.media.entity.MediaAssetEntity;
import com.lifeevent.lid.common.media.enumeration.MediaOwnerScope;
import com.lifeevent.lid.common.media.repository.MediaAssetRepository;
import com.lifeevent.lid.common.media.service.MediaAssetService;
import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.common.service.FileStorageService;
import com.lifeevent.lid.common.service.ImageProcessingService;
import com.lifeevent.lid.common.service.PublicAssetUrlResolver;
import com.lifeevent.lid.common.service.impl.FileStorageSelector;
import com.lifeevent.lid.common.storage.StoragePathUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class MediaAssetServiceImpl implements MediaAssetService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final String LID_OWNER_ID = "LID";
    private static final String UNASSIGNED_PARTNER_OWNER_ID = "PARTNER_UNASSIGNED";

    private final FileStorageSelector fileStorageSelector;
    private final PublicAssetUrlResolver publicAssetUrlResolver;
    private final ImageProcessingService imageProcessingService;
    private final MediaAssetRepository mediaAssetRepository;

    @Override
    public FileUploadResponseDto upload(MultipartFile file, String folder, MediaOwnerScope ownerScope, String ownerUserId, boolean overwrite) {
        MediaOwner owner = resolveUploadOwner(ownerScope, ownerUserId);
        String normalizedFolder = StoragePathUtils.normalizeFolder(folder);
        FileStorageService fileStorageService = fileStorageSelector.activeStorage();
        ProcessedImageFile image = imageProcessingService.compress(file);
        String originalFilename = fallback(file.getOriginalFilename(), image.filename());
        MediaAssetEntity existing = mediaAssetRepository
                .findByOwnerAndOriginalFilenameIgnoreCase(owner.scope(), owner.userId(), originalFilename)
                .orElse(null);

        if (existing != null && !overwrite) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Un média existe déjà avec le nom \"" + originalFilename + "\". Confirme l'écrasement pour le remplacer."
            );
        }

        String storagePath = fileStorageService.upload(image.bytes(), image.filename(), image.contentType(), normalizedFolder);
        String objectKey = StoragePathUtils.normalizeObjectKey(storagePath);

        MediaAssetEntity entity = existing == null ? new MediaAssetEntity() : existing;
        String previousObjectKey = existing == null ? null : existing.getObjectKey();
        entity.setOwnerScope(owner.scope());
        entity.setOwnerUserId(owner.userId());
        entity.setFolder(normalizedFolder);
        entity.setObjectKey(objectKey);
        entity.setOriginalFilename(originalFilename);
        entity.setStoredFilename(filenameFromObjectKey(objectKey));
        entity.setContentType(image.contentType());
        entity.setOriginalSize(image.originalSize());
        entity.setSize(image.bytes().length);

        entity = mediaAssetRepository.save(entity);
        deletePreviousObjectIfReplaced(fileStorageService, previousObjectKey, objectKey);

        return toUploadDto(entity);
    }

    @Override
    public BulkFileUploadResponseDto uploadBulk(MultipartFile[] files, String folder, MediaOwnerScope ownerScope, String ownerUserId, boolean overwrite) {
        List<FileUploadResultDto> results = new ArrayList<>();
        for (MultipartFile file : files == null ? new MultipartFile[0] : files) {
            String originalFilename = file == null ? null : file.getOriginalFilename();
            try {
                results.add(new FileUploadResultDto(originalFilename, true, upload(file, folder, ownerScope, ownerUserId, overwrite), null));
            } catch (Exception ex) {
                results.add(new FileUploadResultDto(originalFilename, false, null, ex.getMessage()));
            }
        }
        return new BulkFileUploadResponseDto(results);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MediaAssetDto> search(MediaOwnerScope ownerScope, String ownerUserId, String folder, String query, int page, int size) {
        MediaSearchFilter filter = resolveSearchFilter(ownerScope, ownerUserId);
        PageRequest pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), MAX_PAGE_SIZE));
        return mediaAssetRepository.search(
                        filter.scope(),
                        filter.ownerUserId(),
                        trimToNull(folder) == null ? null : StoragePathUtils.normalizeFolder(folder),
                        normalizeQuery(query),
                        pageable
                )
                .map(this::toDto);
    }

    @Override
    public void delete(String objectKey) {
        String normalizedKey = StoragePathUtils.normalizeObjectKey(objectKey);
        fileStorageSelector.activeStorage().delete(normalizedKey);
        mediaAssetRepository.deleteByObjectKey(normalizedKey);
    }

    private FileUploadResponseDto toUploadDto(MediaAssetEntity entity) {
        return new FileUploadResponseDto(
                publicAssetUrlResolver.toPublicUrl(entity.getObjectKey()),
                publicAssetUrlResolver.publicBaseUrl(),
                entity.getObjectKey(),
                entity.getObjectKey(),
                entity.getContentType(),
                entity.getOriginalSize(),
                entity.getSize(),
                entity.getId()
        );
    }

    private MediaAssetDto toDto(MediaAssetEntity entity) {
        return new MediaAssetDto(
                entity.getId(),
                entity.getOwnerScope(),
                entity.getOwnerUserId(),
                entity.getFolder(),
                entity.getObjectKey(),
                publicAssetUrlResolver.toPublicUrl(entity.getObjectKey()),
                entity.getOriginalFilename(),
                entity.getStoredFilename(),
                entity.getContentType(),
                entity.getOriginalSize(),
                entity.getSize(),
                entity.getCreatedAt()
        );
    }

    private MediaOwner resolveUploadOwner(MediaOwnerScope requestedScope, String requestedOwnerUserId) {
        String currentUserId = trimToNull(SecurityUtils.getCurrentUserId());
        if (SecurityUtils.hasAnyRole("PARTNER") && !SecurityUtils.hasAnyRole("ADMIN", "SUPER_ADMIN")) {
            return new MediaOwner(MediaOwnerScope.PARTNER, currentUserId);
        }
        MediaOwnerScope scope = requestedScope == null ? MediaOwnerScope.LID : requestedScope;
        String ownerUserId = scope == MediaOwnerScope.PARTNER
                ? fallback(requestedOwnerUserId, UNASSIGNED_PARTNER_OWNER_ID)
                : LID_OWNER_ID;
        return new MediaOwner(scope, ownerUserId);
    }

    private MediaSearchFilter resolveSearchFilter(MediaOwnerScope requestedScope, String requestedOwnerUserId) {
        String currentUserId = trimToNull(SecurityUtils.getCurrentUserId());
        if (SecurityUtils.hasAnyRole("PARTNER") && !SecurityUtils.hasAnyRole("ADMIN", "SUPER_ADMIN")) {
            return new MediaSearchFilter(MediaOwnerScope.PARTNER, currentUserId);
        }
        MediaOwnerScope scope = requestedScope == null ? MediaOwnerScope.LID : requestedScope;
        String ownerUserId = scope == MediaOwnerScope.LID ? LID_OWNER_ID : trimToNull(requestedOwnerUserId);
        return new MediaSearchFilter(scope, ownerUserId);
    }

    private void deletePreviousObjectIfReplaced(FileStorageService fileStorageService, String previousObjectKey, String nextObjectKey) {
        String previous = StoragePathUtils.normalizeObjectKey(previousObjectKey);
        String next = StoragePathUtils.normalizeObjectKey(nextObjectKey);
        if (previous.isBlank() || previous.equals(next)) {
            return;
        }
        fileStorageService.delete(previous);
    }

    private String normalizeQuery(String query) {
        String normalized = trimToNull(query);
        return normalized == null ? null : normalized.toLowerCase(Locale.ROOT);
    }

    private String filenameFromObjectKey(String objectKey) {
        String normalized = StoragePathUtils.normalizeObjectKey(objectKey);
        int slash = normalized.lastIndexOf('/');
        return slash >= 0 ? normalized.substring(slash + 1) : normalized;
    }

    private String fallback(String value, String fallback) {
        String normalized = trimToNull(value);
        return normalized == null ? fallback : normalized;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private record MediaOwner(MediaOwnerScope scope, String userId) {
    }

    private record MediaSearchFilter(MediaOwnerScope scope, String ownerUserId) {
    }
}
