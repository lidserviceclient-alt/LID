package com.lifeevent.lid.core.config;

import com.lifeevent.lid.core.service.BackofficeActivityService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.HandlerInterceptor;

public class BackofficeActivityInterceptor implements HandlerInterceptor {

    private final BackofficeActivityService activityService;

    public BackofficeActivityInterceptor(BackofficeActivityService activityService) {
        this.activityService = activityService;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        String method = request.getMethod();
        if (method == null) return;
        String upper = method.toUpperCase();
        if ("OPTIONS".equals(upper) || "HEAD".equals(upper)) return;

        String uri = request.getRequestURI();
        if (uri == null) uri = "";
        if (!uri.startsWith("/api/backoffice/")) return;
        if (uri.startsWith("/api/backoffice/notifications")) return;

        String query = request.getQueryString();
        String path = query == null || query.isBlank() ? uri : uri + "?" + query;
        Integer status = response != null ? response.getStatus() : null;
        String summary = ex != null ? ex.getClass().getSimpleName() : null;

        if ("GET".equals(upper)) return;

        activityService.record(upper, path, status, summary);
    }
}

