package com.lifeevent.lid.common.service.impl;

import com.lifeevent.lid.common.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Profile("local")
public class LocalFileStorageServiceImpl implements FileStorageService {

    @Value("${storage.local.base-path}")
    private String basePath;

    @Override
    public String upload(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("file must not be empty");
        String objectKey = normalizeFolder(folder) + "/" + UUID.randomUUID() + extensionOf(file.getOriginalFilename());
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
            Files.deleteIfExists(Path.of(basePath).resolve(objectKey).normalize());
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to delete local file", ex);
        }
    }

    private String normalizeFolder(String folder) {
        if (folder == null || folder.isBlank()) return "uploads";
        String v = folder.trim().replace("\\", "/").replaceAll("/+", "/").replaceAll("^/|/$", "");
        return v.isBlank() ? "uploads" : v.replaceAll("[^a-zA-Z0-9/_-]", "_");
    }

    private String extensionOf(String filename) {
        if (filename == null || filename.isBlank()) return "";
        int idx = filename.lastIndexOf('.');
        if (idx <= -1 || idx == filename.length() - 1) return "";
        String ext = filename.substring(idx).toLowerCase();
        return ext.length() <= 10 ? ext : "";
    }

}
