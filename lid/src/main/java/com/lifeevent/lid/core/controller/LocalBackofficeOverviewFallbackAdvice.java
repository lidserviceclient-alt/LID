package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.BackofficeOverviewDto;
import com.lifeevent.lid.core.dto.TeamProductivityDto;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
@Profile({"local", "LOCAL", "local-h2"})
public class LocalBackofficeOverviewFallbackAdvice {

    private static final Logger log = LoggerFactory.getLogger(LocalBackofficeOverviewFallbackAdvice.class);

    @ExceptionHandler(Throwable.class)
    public ResponseEntity<?> handle(Throwable ex, HttpServletRequest request) {
        String uri = request != null ? request.getRequestURI() : null;
        if ("/api/backoffice/overview".equals(uri)) {
            Integer daysParam = null;
            try {
                String raw = request.getParameter("days");
                if (raw != null && !raw.isBlank()) daysParam = Integer.parseInt(raw.trim());
            } catch (Exception ignore) {
                daysParam = null;
            }
            int days = normalizeSeriesDays(daysParam);
            log.error("Erreur /api/backoffice/overview, fallback local activé", ex);
            return ResponseEntity.ok(fallback(days));
        }
        return ResponseEntity.internalServerError().body(java.util.Map.of("message", ex.getMessage() == null ? "Erreur serveur" : ex.getMessage()));
    }

    private static BackofficeOverviewDto fallback(int days) {
        List<Integer> zeros = new ArrayList<>(days);
        for (int i = 0; i < days; i++) zeros.add(0);
        return new BackofficeOverviewDto(
                null,
                List.of(),
                List.of(),
                zeros,
                zeros,
                List.of(),
                List.of(),
                List.of(),
                new TeamProductivityDto(0, 0, 0, null, List.of())
        );
    }

    private static int normalizeSeriesDays(Integer days) {
        if (days == null) return 14;
        int safe = Math.max(1, days);
        return Math.min(safe, 30);
    }
}
