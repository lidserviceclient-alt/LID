package com.lifeevent.lid.common.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Service
public class EmailTemplateService {

    private static final String TEMPLATES_BASE = "templates/emails/";

    public String render(String templateName, Map<String, String> variables) {
        String html = loadTemplate(templateName);
        if (html == null) {
            return buildFallback(variables);
        }
        return replace(html, variables);
    }

    private String loadTemplate(String templateName) {
        String path = TEMPLATES_BASE + templateName + ".html";
        try {
            ClassPathResource resource = new ClassPathResource(path);
            try (InputStream is = resource.getInputStream()) {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (IOException e) {
            log.warn("Email template not found: {}", path);
            return null;
        }
    }

    private String replace(String template, Map<String, String> variables) {
        if (variables == null || variables.isEmpty()) {
            return template;
        }
        String result = template;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            String value = entry.getValue() == null ? "" : entry.getValue();
            result = result.replace("{{" + entry.getKey() + "}}", escapeHtml(value));
        }
        return result;
    }

    private String buildFallback(Map<String, String> variables) {
        StringBuilder sb = new StringBuilder("<div style=\"font-family:sans-serif;\">");
        if (variables != null) {
            for (Map.Entry<String, String> entry : variables.entrySet()) {
                sb.append("<p><strong>").append(escapeHtml(entry.getKey())).append(":</strong> ")
                        .append(escapeHtml(entry.getValue() == null ? "" : entry.getValue()))
                        .append("</p>");
            }
        }
        sb.append("</div>");
        return sb.toString();
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;")
                .replace("\n", "<br>");
    }
}
