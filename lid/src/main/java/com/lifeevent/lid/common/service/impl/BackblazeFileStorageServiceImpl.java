package com.lifeevent.lid.common.service.impl;

import com.lifeevent.lid.common.service.FileStorageService;
import com.lifeevent.lid.common.storage.StoragePathUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;

@Service
@Primary
public class BackblazeFileStorageServiceImpl implements FileStorageService {

    private final S3Client s3Client;
    private final String bucketName;
    private final String backblazeCdnBaseUrl;

    public BackblazeFileStorageServiceImpl(
            S3Client s3Client,
            @Value("${storage.backblaze.bucket-name:lid-images-prod}") String bucketName,
            @Value("${storage.backblaze.cdn-base-url:}") String backblazeCdnBaseUrl
    ) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
        this.backblazeCdnBaseUrl = backblazeCdnBaseUrl;
    }

    @Override
    public String upload(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("file must not be empty");
        }

        String objectKey = StoragePathUtils.buildObjectKey(folder, file.getOriginalFilename());
        String contentType = resolveContentType(file.getContentType());

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectKey)
                            .contentType(contentType)
                            .build(),
                    RequestBody.fromBytes(file.getBytes())
            );
            return "/" + objectKey;
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store file in Backblaze", ex);
        } catch (S3Exception | SdkClientException ex) {
            throw new IllegalStateException("Failed to store file in Backblaze: " + ex.getMessage(), ex);
        } catch (RuntimeException ex) {
            throw new IllegalStateException("Failed to store file in Backblaze", ex);
        }
    }

    @Override
    public String upload(byte[] bytes, String originalFilename, String contentType, String folder) {
        if (bytes == null || bytes.length == 0) {
            throw new IllegalArgumentException("file must not be empty");
        }

        String objectKey = StoragePathUtils.buildObjectKey(folder, originalFilename);

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(objectKey)
                            .contentType(resolveContentType(contentType))
                            .build(),
                    RequestBody.fromBytes(bytes)
            );
            return "/" + objectKey;
        } catch (S3Exception | SdkClientException ex) {
            throw new IllegalStateException("Failed to store file in Backblaze: " + ex.getMessage(), ex);
        } catch (RuntimeException ex) {
            throw new IllegalStateException("Failed to store file in Backblaze", ex);
        }
    }

    @Override
    public void delete(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            throw new IllegalArgumentException("objectKey must not be blank");
        }

        try {
            String normalizedKey = StoragePathUtils.normalizeObjectKey(objectKey);
            s3Client.deleteObject(
                    DeleteObjectRequest.builder()
                            .bucket(bucketName)
                            .key(normalizedKey)
                            .build()
            );
        } catch (S3Exception | SdkClientException ex) {
            throw new IllegalStateException("Failed to delete Backblaze file: " + ex.getMessage(), ex);
        } catch (RuntimeException ex) {
            throw new IllegalStateException("Failed to delete Backblaze file", ex);
        }
    }

    @Override
    public String publicBaseUrl() {
        return StoragePathUtils.normalizeBaseUrl(backblazeCdnBaseUrl);
    }

    private String resolveContentType(String contentType) {
        return (contentType == null || contentType.isBlank())
                ? MediaType.APPLICATION_OCTET_STREAM_VALUE
                : contentType;
    }
}
