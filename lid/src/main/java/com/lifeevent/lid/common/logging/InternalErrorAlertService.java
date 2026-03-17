package com.lifeevent.lid.common.logging;

import com.lifeevent.lid.auth.constant.UserRole;
import com.lifeevent.lid.auth.repository.AuthenticationRepository;
import com.lifeevent.lid.common.service.EmailService;
import com.lifeevent.lid.user.common.entity.UserEntity;
import com.lifeevent.lid.user.common.repository.UserEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class InternalErrorAlertService {

    private final AuthenticationRepository authenticationRepository;
    private final UserEntityRepository userEntityRepository;
    private final EmailService emailService;

    @Value("${config.alerts.internal-error.enabled:true}")
    private boolean enabled;

    @Value("${config.alerts.internal-error.dedup-minutes:10}")
    private long dedupMinutes;

    @Value("${config.alerts.internal-error.fallback-recipients:}")
    private String fallbackRecipients;

    @Value("${config.backoffice.messages.default-recipients:}")
    private String defaultRecipients;

    private final Map<String, Instant> sentByFingerprint = new ConcurrentHashMap<>();

    @Async("externalIoExecutor")
    public void notifyInternalError(String apiPath, Exception ex) {
        if (!enabled || ex == null) {
            return;
        }
        String fingerprint = buildFingerprint(apiPath, ex);
        if (!allowSendNow(fingerprint)) {
            return;
        }

        List<String> recipients = resolveRecipients();
        if (recipients.isEmpty()) {
            log.warn("No SUPER_ADMIN recipients found for internal error alert");
            return;
        }

        String subject = "[LID][INTERNAL_ERROR] " + ex.getClass().getSimpleName();
        String body = buildBody(apiPath, ex, fingerprint);

        for (String to : recipients) {
            try {
                emailService.send(to, subject, body);
            } catch (Exception mailEx) {
                log.warn("Failed to send internal error alert to {}: {}", to, mailEx.getMessage());
            }
        }
    }

    private String buildFingerprint(String apiPath, Exception ex) {
        String className = ex.getClass().getName();
        String top = "";
        if (ex.getStackTrace() != null && ex.getStackTrace().length > 0) {
            StackTraceElement ste = ex.getStackTrace()[0];
            top = ste.getClassName() + "#" + ste.getMethodName() + ":" + ste.getLineNumber();
        }
        return (normalize(apiPath) + "|" + className + "|" + normalize(top)).toLowerCase(Locale.ROOT);
    }

    private boolean allowSendNow(String fingerprint) {
        Instant now = Instant.now();
        Instant previous = sentByFingerprint.get(fingerprint);
        if (previous != null && previous.plusSeconds(Math.max(1, dedupMinutes) * 60).isAfter(now)) {
            return false;
        }
        sentByFingerprint.put(fingerprint, now);
        cleanupOld(now);
        return true;
    }

    private void cleanupOld(Instant now) {
        long ttl = Math.max(1, dedupMinutes) * 60;
        sentByFingerprint.entrySet().removeIf(e -> e.getValue().plusSeconds(ttl).isBefore(now));
    }

    private List<String> resolveRecipients() {
        List<String> superAdminUserIds = authenticationRepository.findUserIdsByRolesIn(List.of(UserRole.SUPER_ADMIN));
        Set<String> fromUsers = userEntityRepository.findAllById(superAdminUserIds).stream()
                .filter(u -> u.getEmail() != null && !u.getEmail().isBlank())
                .map(UserEntity::getEmail)
                .map(this::normalize)
                .filter(v -> v != null && !v.isBlank())
                .collect(java.util.stream.Collectors.toSet());

        if (!fromUsers.isEmpty()) {
            return fromUsers.stream().toList();
        }
        List<String> fallback = parseEmails(fallbackRecipients);
        if (!fallback.isEmpty()) {
            return fallback;
        }
        return parseEmails(defaultRecipients);
    }

    private List<String> parseEmails(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return Arrays.stream(raw.split(","))
                .map(this::normalize)
                .filter(v -> v != null && !v.isBlank())
                .distinct()
                .toList();
    }

    private String buildBody(String apiPath, Exception ex, String fingerprint) {
        StringBuilder sb = new StringBuilder();
        sb.append("Internal error detected").append(System.lineSeparator());
        sb.append("Time: ").append(DateTimeFormatter.ISO_DATE_TIME.format(LocalDateTime.now(ZoneId.systemDefault()))).append(System.lineSeparator());
        sb.append("Path: ").append(apiPath).append(System.lineSeparator());
        sb.append("Exception: ").append(ex.getClass().getName()).append(System.lineSeparator());
        sb.append("Message: ").append(ex.getMessage()).append(System.lineSeparator());
        sb.append("Fingerprint: ").append(fingerprint).append(System.lineSeparator());
        if (ex.getStackTrace() != null && ex.getStackTrace().length > 0) {
            StackTraceElement ste = ex.getStackTrace()[0];
            sb.append("Top stack: ").append(ste.getClassName()).append("#")
                    .append(ste.getMethodName()).append(":").append(ste.getLineNumber());
        }
        return sb.toString();
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        return value.trim();
    }
}
