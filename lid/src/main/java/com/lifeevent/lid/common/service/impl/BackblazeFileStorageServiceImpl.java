package com.lifeevent.lid.common.service.impl;

import com.backblaze.b2.client.B2StorageClient;
import com.backblaze.b2.client.contentSources.B2FileContentSource;
import com.backblaze.b2.client.exceptions.B2Exception;
import com.backblaze.b2.client.structures.B2UploadFileRequest;
import com.lifeevent.lid.common.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
@Profile("!local")
@RequiredArgsConstructor
public class BackblazeFileStorageServiceImpl implements FileStorageService {

    private final ObjectProvider<B2StorageClient> b2StorageClientProvider;

    @Value("${backblaze.bucket-id:}")
    private String bucketId;

    @Value("${backblaze.public-base-url:}")
    private String publicBaseUrl;

    @Override
    public String upload(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("file must not be empty");
        }

        String objectKey = buildObjectKey(folder, file.getOriginalFilename());
        String contentType = resolveContentType(file.getContentType());

        B2StorageClient client = requireClient();
        uploadToBackblaze(client, file, objectKey, contentType);
        return "/" + objectKey;
    }

    @Override
    public void delete(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            throw new IllegalArgumentException("objectKey must not be blank");
        }

        try {
            requireClient().hideFile(bucketId, objectKey);
        } catch (B2Exception ex) {
            throw new IllegalStateException("Failed to delete file from Backblaze", ex);
        }
    }

    private void uploadToBackblaze(B2StorageClient client, MultipartFile file, String objectKey, String contentType) {
        Path temp = null;
        try {
            temp = Files.createTempFile("lid-b2-", ".tmp");
            file.transferTo(temp);
            B2UploadFileRequest request = B2UploadFileRequest.builder(
                    bucketId,
                    objectKey,
                    contentType,
                    B2FileContentSource.build(temp.toFile())
            ).build();
            client.uploadSmallFile(request);
        } catch (IOException | B2Exception ex) {
            throw new IllegalStateException("Failed to upload file to Backblaze", ex);
        } finally {
            if (temp != null) {
                try {
                    Files.deleteIfExists(temp);
                } catch (IOException ignored) {
                }
            }
        }
    }

    private B2StorageClient requireClient() {
        B2StorageClient client = b2StorageClientProvider.getIfAvailable();
        if (client == null) {
            throw new IllegalStateException("B2StorageClient bean is not configured");
        }
        if (!isBackblazeConfigured()) {
            throw new IllegalStateException("Backblaze properties are not configured");
        }
        return client;
    }

    private boolean isBackblazeConfigured() {
        return bucketId != null && !bucketId.isBlank()
                && publicBaseUrl != null && !publicBaseUrl.isBlank();
    }

    private String resolveContentType(String contentType) {
        return (contentType == null || contentType.isBlank())
                ? MediaType.APPLICATION_OCTET_STREAM_VALUE
                : contentType;
    }

    private String buildObjectKey(String folder, String originalFilename) {
        return normalizeFolder(folder) + "/" + UUID.randomUUID() + extensionOf(originalFilename);
    }

    private String normalizeFolder(String folder) {
        if (folder == null || folder.isBlank()) {
            return "uploads";
        }
        String normalized = folder.trim().replace("\\", "/");
        normalized = normalized.replaceAll("/+", "/").replaceAll("^/|/$", "");
        normalized = normalized.replaceAll("[^a-zA-Z0-9/_-]", "_");
        return normalized.isBlank() ? "uploads" : normalized;
    }

    private String extensionOf(String filename) {
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
    
}
