package com.lifeevent.lid.common.service.impl;

import com.lifeevent.lid.common.service.FileStorageService;
import com.lifeevent.lid.common.service.PublicAssetUrlResolver;
import com.lifeevent.lid.common.storage.StoragePathUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DefaultPublicAssetUrlResolver implements PublicAssetUrlResolver {

    private static final Logger log = LoggerFactory.getLogger(DefaultPublicAssetUrlResolver.class);

    private final FileStorageSelector fileStorageSelector;

    @Value("${storage.local.cdn-base-url:}")
    private String localCdnBaseUrl;

    @Value("${storage.local.public-base-url:/api/v1/cdn}")
    private String localPublicBaseUrl;

    @Value("${storage.backblaze.cdn-base-url:}")
    private String backblazeCdnBaseUrl;

    @Value("${storage.backblaze.public-base-url:}")
    private String backblazePublicBaseUrl;

    @Override
    public String toPublicUrl(String objectKey) {
        String key = StoragePathUtils.normalizeObjectKey(objectKey);
        String base = resolveBaseUrl();
        return StoragePathUtils.joinPublicUrl(base, key);
    }

    private String resolveBaseUrl() {
        if (isBackblazeStorageActive()) {
            String cdnBase = StoragePathUtils.normalizeBaseUrl(backblazeCdnBaseUrl);
            if (cdnBase != null) {
                return cdnBase;
            }
            String fallback = StoragePathUtils.normalizeBaseUrl(backblazePublicBaseUrl);
            if (fallback != null) {
                log.warn("storage.backblaze.cdn-base-url is not configured. Falling back to storage.backblaze.public-base-url.");
                return fallback;
            }
            return null;
        }

        String cdnBase = StoragePathUtils.normalizeBaseUrl(localCdnBaseUrl);
        if (cdnBase != null) {
            return cdnBase;
        }
        return StoragePathUtils.normalizeBaseUrl(localPublicBaseUrl);
    }

    private boolean isBackblazeStorageActive() {
        FileStorageService activeStorage = fileStorageSelector.activeStorage();
        return activeStorage instanceof BackblazeFileStorageServiceImpl;
    }
}
