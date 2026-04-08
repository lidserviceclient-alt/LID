package com.lifeevent.lid.common.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.HandlerMapping;

import java.io.IOException;
import java.nio.file.Path;

@Controller
@RequestMapping("/api/v1/cdn")
public class LocalStorageController {

    @Value("${storage.local.base-path}")
    private String basePath;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @GetMapping("/**")
    public ResponseEntity<Resource> read(HttpServletRequest request) throws IOException {
        String full = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        String pattern = (String) request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        String objectKey = pathMatcher.extractPathWithinPattern(pattern, full);
        Path root = Path.of(basePath).toAbsolutePath().normalize();
        Path file = root.resolve(objectKey).normalize();
        if (!file.startsWith(root) || !file.toFile().exists() || !file.toFile().isFile()) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(file.toUri());
        MediaType type = MediaTypeFactory.getMediaType(resource).orElse(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok().contentType(type).body(resource);
    }
}
