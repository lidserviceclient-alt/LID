package com.lifeevent.lid.common.storage;

import java.text.Normalizer;
import java.util.Locale;

public final class StoragePathUtils {

    private StoragePathUtils() {
    }

    public static String buildObjectKey(String folder, String originalFilename) {
        return normalizeFolder(folder) + "/" + sanitizeFilename(originalFilename);
    }

    public static String normalizeFolder(String folder) {
        if (folder == null || folder.isBlank()) {
            return "uploads";
        }
        String normalized = folder.trim().replace("\\", "/");
        normalized = normalized.replaceAll("/+", "/").replaceAll("^/|/$", "");
        normalized = normalized.replaceAll("[^a-zA-Z0-9/_-]", "_");
        return normalized.isBlank() ? "uploads" : normalized;
    }

    public static String extensionOf(String filename) {
        if (filename == null || filename.isBlank()) {
            return "";
        }
        int idx = filename.lastIndexOf('.');
        if (idx <= -1 || idx == filename.length() - 1) {
            return "";
        }
        String ext = filename.substring(idx).toLowerCase();
        return ext.length() <= 10 ? ext : "";
    }

    public static String sanitizeFilename(String filename) {
        String raw = filename == null || filename.isBlank() ? "image" : filename.trim();
        String normalized = Normalizer.normalize(raw, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        int dot = normalized.lastIndexOf('.');
        String base = dot > 0 ? normalized.substring(0, dot) : normalized;
        String ext = extensionOf(normalized);
        base = base
                .replace("\\", "/")
                .replaceAll("^.+/", "")
                .replaceAll("[^a-zA-Z0-9._-]+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^[._-]+|[._-]+$", "");
        if (base.isBlank()) {
            base = "image";
        }
        return base.toLowerCase(Locale.ROOT) + ext;
    }

    public static String sanitizePathSegment(String value) {
        String raw = value == null || value.isBlank() ? "unknown" : value.trim();
        String normalized = Normalizer.normalize(raw, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace("\\", "/")
                .replaceAll("^.+/", "")
                .replaceAll("[^a-zA-Z0-9_-]+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^[._-]+|[._-]+$", "");
        return normalized.isBlank() ? "unknown" : normalized.toLowerCase(Locale.ROOT);
    }

    public static String normalizeObjectKey(String objectKey) {
        if (objectKey == null) {
            return "";
        }
        return objectKey.trim().replace("\\", "/").replaceAll("^/+", "");
    }

    public static String normalizeBaseUrl(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return null;
        }
        String normalized = baseUrl.trim();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized.isBlank() ? null : normalized;
    }

    public static String joinPublicUrl(String baseUrl, String objectKey) {
        String normalizedKey = normalizeObjectKey(objectKey);
        String normalizedBase = normalizeBaseUrl(baseUrl);
        if (normalizedBase == null) {
            return "/" + normalizedKey;
        }
        return normalizedBase + "/" + normalizedKey;
    }
}
