package com.lifeevent.lid.common.service.impl;

import com.backblaze.b2.client.B2StorageClient;
import com.backblaze.b2.client.contentSources.B2FileContentSource;
import com.backblaze.b2.client.exceptions.B2Exception;
import com.backblaze.b2.client.structures.B2UploadFileRequest;
import com.lifeevent.lid.common.service.FileStorageService;
import com.lifeevent.lid.common.storage.StoragePathUtils;
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

@Service
@Profile("!local")
@RequiredArgsConstructor
public class BackblazeFileStorageServiceImpl implements FileStorageService {

    private final ObjectProvider<B2StorageClient> b2StorageClientProvider;

    @Value("${storage.backblaze.bucket-id:}")
    private String bucketId;

    @Override
    public String upload(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("file must not be empty");
        }

        String objectKey = StoragePathUtils.buildObjectKey(folder, file.getOriginalFilename());
        String contentType = resolveContentType(file.getContentType());

        B2StorageClient client = requireClient();
        uploadToBackblaze(client, file, objectKey, contentType);
        return "/" + objectKey;
    }

    @Override
    public String upload(byte[] bytes, String originalFilename, String contentType, String folder) {
        if (bytes == null || bytes.length == 0) {
            throw new IllegalArgumentException("file must not be empty");
        }

        String objectKey = StoragePathUtils.buildObjectKey(folder, originalFilename);
        B2StorageClient client = requireClient();
        uploadToBackblaze(client, bytes, objectKey, resolveContentType(contentType));
        return "/" + objectKey;
    }

    @Override
    public void delete(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            throw new IllegalArgumentException("objectKey must not be blank");
        }

        try {
            String normalizedKey = StoragePathUtils.normalizeObjectKey(objectKey);
            requireClient().hideFile(bucketId, normalizedKey);
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

    private void uploadToBackblaze(B2StorageClient client, byte[] bytes, String objectKey, String contentType) {
        Path temp = null;
        try {
            temp = Files.createTempFile("lid-b2-", ".tmp");
            Files.write(temp, bytes);
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
        return bucketId != null && !bucketId.isBlank();
    }

    private String resolveContentType(String contentType) {
        return (contentType == null || contentType.isBlank())
                ? MediaType.APPLICATION_OCTET_STREAM_VALUE
                : contentType;
    }

}
