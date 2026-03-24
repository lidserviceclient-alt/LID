package com.lifeevent.lid.common.service.impl;

import com.lifeevent.lid.common.service.FileStorageService;
import com.lifeevent.lid.common.storage.StoragePathUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Service
@Primary
public class LocalFileStorageServiceImpl implements FileStorageService {

    @Value("${storage.local.base-path}")
    private String basePath;

    @Override
    public String upload(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("file must not be empty");
        String objectKey = StoragePathUtils.buildObjectKey(folder, file.getOriginalFilename());
        Path target = Path.of(basePath).resolve(objectKey).normalize();
        try {
            Files.createDirectories(target.getParent());
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/" + objectKey;
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store file locally", ex);
        }
    }

    @Override
    public void delete(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) throw new IllegalArgumentException("objectKey must not be blank");
        try {
            String normalizedKey = StoragePathUtils.normalizeObjectKey(objectKey);
            Files.deleteIfExists(Path.of(basePath).resolve(normalizedKey).normalize());
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to delete local file", ex);
        }
    }
}
