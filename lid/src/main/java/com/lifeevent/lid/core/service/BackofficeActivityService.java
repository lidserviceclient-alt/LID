package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.BackofficeActivityDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

@Service
public class BackofficeActivityService {

    private final Object lock = new Object();
    private final Deque<BackofficeActivityDto> buffer = new ArrayDeque<>();
    private final int maxSize = 500;

    @Transactional
    public void record(String method, String path, Integer status, String summary) {
        BackofficeActivityDto dto = new BackofficeActivityDto(
                java.util.UUID.randomUUID().toString(),
                resolveActor(),
                method,
                path,
                status,
                summary,
                LocalDateTime.now()
        );
        synchronized (lock) {
            buffer.addFirst(dto);
            while (buffer.size() > maxSize) {
                buffer.removeLast();
            }
        }
    }

    @Transactional(readOnly = true)
    public Page<BackofficeActivityDto> list(LocalDateTime since, Pageable pageable) {
        List<BackofficeActivityDto> all = new ArrayList<>();
        synchronized (lock) {
            for (BackofficeActivityDto dto : buffer) {
                if (since != null && (dto.createdAt() == null || !dto.createdAt().isAfter(since))) {
                    break;
                }
                all.add(dto);
            }
        }

        int total = all.size();
        int start = (int) pageable.getOffset();
        if (start >= total) {
            return new PageImpl<>(List.of(), pageable, total);
        }
        int end = Math.min(start + pageable.getPageSize(), total);
        return new PageImpl<>(all.subList(start, end), pageable, total);
    }

    @Transactional(readOnly = true)
    public long countSince(LocalDateTime since) {
        long count = 0;
        synchronized (lock) {
            for (BackofficeActivityDto dto : buffer) {
                if (since != null && (dto.createdAt() == null || !dto.createdAt().isAfter(since))) {
                    break;
                }
                count++;
            }
        }
        return count;
    }

    private String resolveActor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwt) {
            String email = jwt.getToken().getClaimAsString("email");
            if (email != null && !email.isBlank()) return email;
            String sub = jwt.getName();
            if (sub != null && !sub.isBlank()) return sub;
        }
        if (auth != null && auth.getName() != null && !auth.getName().isBlank()) return auth.getName();
        return "system";
    }
}
