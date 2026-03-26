package com.lifeevent.lid.common.controller;

import com.lifeevent.lid.common.dto.FileUploadResponseDto;
import com.lifeevent.lid.common.service.FileStorageService;
import com.lifeevent.lid.common.service.PublicAssetUrlResolver;
import com.lifeevent.lid.common.service.impl.FileStorageSelector;
import com.lifeevent.lid.common.storage.StoragePathUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping({"/api/v1/storage"})
@RequiredArgsConstructor
public class FileStorageController implements IFileStorageController {

    private final FileStorageSelector fileStorageSelector;
    private final PublicAssetUrlResolver publicAssetUrlResolver;

    @Override
    public ResponseEntity<FileUploadResponseDto> upload(@RequestPart("file") MultipartFile file,
                                                        @RequestParam(value = "folder", required = false) String folder) {
        FileStorageService fileStorageService = fileStorageSelector.activeStorage();
        String storagePath = fileStorageService.upload(file, folder);
        String objectKey = StoragePathUtils.normalizeObjectKey(storagePath);
        String cdnBaseUrl = publicAssetUrlResolver.publicBaseUrl();
        String url = publicAssetUrlResolver.toPublicUrl(objectKey);
        return ResponseEntity.ok(new FileUploadResponseDto(
                url,
                cdnBaseUrl,
                objectKey,
                objectKey
        ));
    }

    @Override
    public ResponseEntity<Void> delete(@RequestParam("objectKey") String objectKey) {
        FileStorageService fileStorageService = fileStorageSelector.activeStorage();
        fileStorageService.delete(objectKey);
        return ResponseEntity.noContent().build();
    }
}
