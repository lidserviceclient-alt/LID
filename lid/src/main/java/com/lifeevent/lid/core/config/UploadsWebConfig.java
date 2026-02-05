package com.lifeevent.lid.core.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class UploadsWebConfig implements WebMvcConfigurer {

    private final String uploadsPath;

    public UploadsWebConfig(@Value("${lid.upload-dir:${user.dir}/uploads}") String uploadDir) {
        Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.uploadsPath = root.toString().endsWith("\\") || root.toString().endsWith("/")
                ? root.toString()
                : root.toString() + "/";
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadsPath);
    }
}
