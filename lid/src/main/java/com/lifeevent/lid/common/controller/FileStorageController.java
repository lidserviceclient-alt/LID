package com.lifeevent.lid.common.controller;

import com.lifeevent.lid.common.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/storage"})
@RequiredArgsConstructor
public class FileStorageController implements IFileStorageController {

    private final FileStorageService fileStorageService;

    @Value("${backblaze.public-base-url:}")
    private String backblazePublicBaseUrl;

    @Value("${storage.local.public-base-url:/uploads}")
    private String localPublicBaseUrl;

    @Override
    public ResponseEntity<Map<String, String>> upload(@RequestPart("file") MultipartFile file,
                                                      @RequestParam(value = "folder", required = false) String folder) {
        String url = fileStorageService.upload(file, folder);
        String objectKey = extractObjectKey(url);
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("url", url);
        payload.put("objectKey", objectKey);
        return ResponseEntity.ok(payload);
    }

    @Override
    public ResponseEntity<Void> delete(@RequestParam("objectKey") String objectKey) {
        fileStorageService.delete(objectKey);
        return ResponseEntity.noContent().build();
    }

    private String extractObjectKey(String url) {
        if (url == null || url.isBlank()) {
            return "";
        }
        String path = normalizePath(extractPath(url));
        String backblazePrefix = normalizePath(extractPath(backblazePublicBaseUrl));
        String localPrefix = normalizePath(extractPath(localPublicBaseUrl));

        String fromBackblazePrefix = removePrefix(path, backblazePrefix);
        if (fromBackblazePrefix != null) {
            return fromBackblazePrefix;
        }

        String fromLocalPrefix = removePrefix(path, localPrefix);
        if (fromLocalPrefix != null) {
            return fromLocalPrefix;
        }

        return path;
    }

    private String extractPath(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        try {
            URI uri = URI.create(value);
            String uriPath = uri.getPath();
            return uriPath == null ? value : uriPath;
        } catch (IllegalArgumentException ex) {
            return value;
        }
    }

    private String normalizePath(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String normalized = value.trim().replace("\\", "/");
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    private String removePrefix(String path, String prefix) {
        if (prefix == null || prefix.isBlank()) {
            return null;
        }
        if (path.equals(prefix)) {
            return "";
        }
        if (path.startsWith(prefix + "/")) {
            return path.substring(prefix.length() + 1);
        }
        return null;
    }
}
