package com.lifeevent.lid.core.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
public class CategoryImageStorageService {

    private final Path uploadRoot;

    public CategoryImageStorageService(@Value("${lid.upload-dir:${user.dir}/uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String storeCategoryImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fichier image requis.");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Le fichier doit être une image.");
        }
        if (file.getSize() > 5L * 1024L * 1024L) {
            throw new IllegalArgumentException("Image trop volumineuse (max 5MB).");
        }

        String extension = extractExtension(file.getOriginalFilename());
        if (extension == null) {
            extension = extensionFromContentType(contentType);
        }
        if (extension == null) {
            extension = ".img";
        }

        String filename = UUID.randomUUID() + extension;
        Path dir = uploadRoot.resolve("categories");
        Path target = dir.resolve(filename).normalize();
        if (!target.startsWith(dir)) {
            throw new IllegalArgumentException("Nom de fichier invalide.");
        }
        try {
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Impossible d'enregistrer l'image.", e);
        }
        return "/uploads/categories/" + filename;
    }

    private String extractExtension(String filename) {
        if (filename == null) return null;
        String name = filename.trim();
        int idx = name.lastIndexOf('.');
        if (idx <= 0 || idx == name.length() - 1) return null;
        String ext = name.substring(idx).toLowerCase(Locale.ROOT);
        if (ext.length() > 8) return null;
        if (!ext.matches("\\.[a-z0-9]+")) return null;
        return ext;
    }

    private String extensionFromContentType(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> null;
        };
    }
}
