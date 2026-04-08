package com.lifeevent.lid.common.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String upload(MultipartFile file, String folder);
    String upload(byte[] bytes, String originalFilename, String contentType, String folder);
    void delete(String objectKey);
}
