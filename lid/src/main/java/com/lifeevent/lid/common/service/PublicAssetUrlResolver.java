package com.lifeevent.lid.common.service;

public interface PublicAssetUrlResolver {
    String toPublicUrl(String objectKey);

    String publicBaseUrl();
}
