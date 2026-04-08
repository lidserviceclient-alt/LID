package com.lifeevent.lid.common.controller;

import com.lifeevent.lid.common.dto.BulkFileUploadResponseDto;
import com.lifeevent.lid.common.dto.FileUploadResponseDto;
import com.lifeevent.lid.common.media.dto.MediaAssetDto;
import com.lifeevent.lid.common.media.enumeration.MediaOwnerScope;
import com.lifeevent.lid.common.media.service.MediaAssetService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/storage")
@RequiredArgsConstructor
public class FileStorageController implements IFileStorageController {

    private final MediaAssetService mediaAssetService;

    @Override
    public ResponseEntity<FileUploadResponseDto> upload(@RequestPart("file") MultipartFile file,
                                                        @RequestParam(value = "folder", required = false) String folder,
                                                        @RequestParam(value = "ownerScope", required = false) MediaOwnerScope ownerScope,
                                                        @RequestParam(value = "ownerUserId", required = false) String ownerUserId,
                                                        @RequestParam(value = "overwrite", defaultValue = "false") boolean overwrite,
                                                        HttpServletRequest request) {
        return ResponseEntity.ok(mediaAssetService.upload(file, folder, ownerScope, ownerUserId, overwrite));
    }

    @Override
    public ResponseEntity<BulkFileUploadResponseDto> uploadBulk(MultipartFile[] files,
                                                                String folder,
                                                                MediaOwnerScope ownerScope,
                                                                String ownerUserId,
                                                                boolean overwrite,
                                                                HttpServletRequest request) {
        return ResponseEntity.ok(mediaAssetService.uploadBulk(files, folder, ownerScope, ownerUserId, overwrite));
    }

    @Override
    public ResponseEntity<Page<MediaAssetDto>> listMedia(MediaOwnerScope ownerScope,
                                                         String ownerUserId,
                                                         String folder,
                                                         String q,
                                                         int page,
                                                         int size) {
        return ResponseEntity.ok(mediaAssetService.search(ownerScope, ownerUserId, folder, q, page, size));
    }

    @Override
    public ResponseEntity<Void> delete(@RequestParam("objectKey") String objectKey) {
        mediaAssetService.delete(objectKey);
        return ResponseEntity.noContent().build();
    }
}
