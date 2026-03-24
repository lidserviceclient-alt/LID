package com.lifeevent.lid.common.controller;

import com.lifeevent.lid.common.service.FileStorageService;
import com.lifeevent.lid.common.service.PublicAssetUrlResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/storage"})
@RequiredArgsConstructor
public class FileStorageController implements IFileStorageController {

    private final FileStorageService fileStorageService;
    private final PublicAssetUrlResolver publicAssetUrlResolver;

    @Override
    public ResponseEntity<Map<String, String>> upload(@RequestPart("file") MultipartFile file,
                                                      @RequestParam(value = "folder", required = false) String folder) {
        String storagePath = fileStorageService.upload(file, folder);
        String objectKey = normalizeObjectKey(storagePath);
        String url = publicAssetUrlResolver.toPublicUrl(objectKey);
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

    private String normalizeObjectKey(String storagePath) {
        if (storagePath == null) {
            return "";
        }
        return storagePath.trim().replace("\\", "/").replaceAll("^/+", "");
    }
}
