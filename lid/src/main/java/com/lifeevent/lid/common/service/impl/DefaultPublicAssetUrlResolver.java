package com.lifeevent.lid.common.service.impl;

import com.lifeevent.lid.common.service.FileStorageService;
import com.lifeevent.lid.common.service.PublicAssetUrlResolver;
import com.lifeevent.lid.common.storage.StoragePathUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DefaultPublicAssetUrlResolver implements PublicAssetUrlResolver {

    private final FileStorageService fileStorageService;

    @Value("${storage.cdn-base-url:}")
    private String globalCdnBaseUrl;

    @Override
    public String toPublicUrl(String objectKey) {
        String key = StoragePathUtils.normalizeObjectKey(objectKey);
        return StoragePathUtils.joinPublicUrl(publicBaseUrl(), key);
    }

    @Override
    public String publicBaseUrl() {
        String storageBaseUrl = StoragePathUtils.normalizeBaseUrl(fileStorageService.publicBaseUrl());
        if (storageBaseUrl != null) {
            return storageBaseUrl;
        }
        return StoragePathUtils.normalizeBaseUrl(globalCdnBaseUrl);
    }
}
