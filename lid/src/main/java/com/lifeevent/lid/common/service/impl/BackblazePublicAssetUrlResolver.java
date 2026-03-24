package com.lifeevent.lid.common.service.impl;

import com.lifeevent.lid.common.service.PublicAssetUrlResolver;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!local")
public class BackblazePublicAssetUrlResolver implements PublicAssetUrlResolver {

    private static final Logger log = LoggerFactory.getLogger(BackblazePublicAssetUrlResolver.class);

    @Value("${backblaze.cdn-base-url:}")
    private String cdnBaseUrl;

    @Value("${backblaze.public-base-url:}")
    private String publicBaseUrl;

    @PostConstruct
    void validateConfiguration() {
        if (isBlank(cdnBaseUrl)) {
            log.warn("backblaze.cdn-base-url is not configured. Falling back to backblaze.public-base-url.");
        }
    }

    @Override
    public String toPublicUrl(String objectKey) {
        String normalizedKey = normalizeObjectKey(objectKey);
        String cdnBase = normalizeBaseUrl(cdnBaseUrl);
        if (cdnBase != null) {
            return cdnBase + "/" + normalizedKey;
        }
        String fallbackBase = normalizeBaseUrl(publicBaseUrl);
        if (fallbackBase != null) {
            return fallbackBase + "/" + normalizedKey;
        }
        return "/" + normalizedKey;
    }

    private String normalizeObjectKey(String objectKey) {
        if (objectKey == null) {
            return "";
        }
        return objectKey.trim().replace("\\", "/").replaceAll("^/+", "");
    }

    private String normalizeBaseUrl(String baseUrl) {
        if (isBlank(baseUrl)) {
            return null;
        }
        String normalized = baseUrl.trim();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized.isBlank() ? null : normalized;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
