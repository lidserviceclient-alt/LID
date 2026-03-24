package com.lifeevent.lid.common.service.impl;

import com.lifeevent.lid.common.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class FileStorageSelector {

    private static final String BACKBLAZE_BEAN_NAME = "backblazeFileStorageServiceImpl";

    private final ApplicationContext applicationContext;
    private final ConfigurableListableBeanFactory beanFactory;

    public FileStorageService activeStorage() {
        Map<String, FileStorageService> storages = applicationContext.getBeansOfType(FileStorageService.class);
        if (storages.isEmpty()) {
            throw new IllegalStateException("No FileStorageService bean is configured");
        }
        if (storages.size() == 1) {
            return storages.values().iterator().next();
        }

        for (Map.Entry<String, FileStorageService> entry : storages.entrySet()) {
            String beanName = entry.getKey();
            if (beanFactory.containsBeanDefinition(beanName) && beanFactory.getBeanDefinition(beanName).isPrimary()) {
                return entry.getValue();
            }
        }

        FileStorageService backblaze = storages.get(BACKBLAZE_BEAN_NAME);
        if (backblaze != null) {
            return backblaze;
        }

        return storages.values().iterator().next();
    }
}
