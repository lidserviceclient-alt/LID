package com.lifeevent.lid.common.service.impl;

import com.lifeevent.lid.common.service.PublicAssetUrlResolver;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
public class LocalPublicAssetUrlResolver implements PublicAssetUrlResolver {

    @Value("${storage.local.cdn-base-url:}")
    private String cdnBaseUrl;

    @Value("${storage.local.public-base-url:/uploads}")
    private String publicBaseUrl;

    @Override
    public String toPublicUrl(String objectKey) {
        String normalizedKey = normalizeObjectKey(objectKey);
        String base = normalizeBaseUrl(cdnBaseUrl);
        if (base == null) {
            base = normalizeBaseUrl(publicBaseUrl);
        }
        if (base == null) {
            return "/" + normalizedKey;
        }
        return base + "/" + normalizedKey;
    }

    private String normalizeObjectKey(String objectKey) {
        if (objectKey == null) {
            return "";
        }
        return objectKey.trim().replace("\\", "/").replaceAll("^/+", "");
    }

    private String normalizeBaseUrl(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return null;
        }
        String normalized = baseUrl.trim();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized.isBlank() ? null : normalized;
    }
}
