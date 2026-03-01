package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.BackofficeMessageDto;
import com.lifeevent.lid.core.dto.CreateBackofficeMessageRequest;
import com.lifeevent.lid.core.entity.BackofficeMessage;
import com.lifeevent.lid.core.enums.BackofficeMessageStatus;
import com.lifeevent.lid.core.repository.BackofficeMessageRepository;
import jakarta.mail.internet.InternetAddress;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class BackofficeMessageService {

    private final BackofficeMessageRepository repository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${config.backoffice.messages.default-recipients:ahobautfrederick@gmail.com,eeeeee@lid.local}")
    private String defaultRecipients;

    public BackofficeMessageService(BackofficeMessageRepository repository, JavaMailSender mailSender) {
        this.repository = repository;
        this.mailSender = mailSender;
    }

    @Transactional(readOnly = true)
    public Page<BackofficeMessageDto> list(Pageable pageable) {
        return repository.findAllByOrderByCreatedAtDesc(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public BackofficeMessageDto get(String id) {
        BackofficeMessage m = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Message non trouvé"));
        return toDto(m);
    }

    @Transactional
    public BackofficeMessageDto createAndSend(CreateBackofficeMessageRequest request) {
        List<String> recipients = resolveRecipients(request.recipients());
        validateRecipients(recipients);

        BackofficeMessage m = new BackofficeMessage();
        m.setSubject(request.subject().trim());
        m.setBody(request.body().trim());
        m.setRecipients(String.join(",", recipients));
        m.setStatus(BackofficeMessageStatus.PENDING);
        m.setCreatedBy(resolveActor());

        BackofficeMessage saved = repository.save(m);
        attemptSend(saved);
        return toDto(saved);
    }

    @Transactional
    public BackofficeMessageDto retry(String id) {
        BackofficeMessage m = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Message non trouvé"));
        attemptSend(m);
        return toDto(m);
    }

    @Transactional
    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Message non trouvé");
        }
        repository.deleteById(id);
    }

    @Scheduled(fixedDelayString = "${config.backoffice.messages.retry-delay-ms:60000}")
    @Transactional
    public void retryFailedMessages() {
        LocalDateTime now = LocalDateTime.now();
        List<BackofficeMessage> due = repository.findByStatusAndNextRetryAtBeforeOrderByNextRetryAtAsc(BackofficeMessageStatus.FAILED, now);
        for (BackofficeMessage m : due) {
            if (m.getAttempts() >= 5) continue;
            attemptSend(m);
        }
    }

    private void attemptSend(BackofficeMessage m) {
        List<String> recipients = parseRecipients(m.getRecipients());
        validateRecipients(recipients);

        m.setAttempts(m.getAttempts() + 1);
        m.setLastError(null);
        m.setNextRetryAt(null);

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(recipients.toArray(String[]::new));
            if (fromEmail != null && !fromEmail.isBlank()) msg.setFrom(fromEmail);
            msg.setSubject(m.getSubject() != null ? m.getSubject() : "Message backoffice");
            msg.setText(m.getBody() != null ? m.getBody() : "");
            mailSender.send(msg);

            m.setStatus(BackofficeMessageStatus.SENT);
            m.setSentAt(LocalDateTime.now());
        } catch (Exception ex) {
            System.err.println("BACKOFFICE MAIL FAILED: " + ex.getMessage());
            ex.printStackTrace();
            m.setStatus(BackofficeMessageStatus.FAILED);
            m.setLastError(ex.getMessage());
            m.setNextRetryAt(nextRetryAt(m.getAttempts()));
        }

        repository.save(m);
    }

    private static LocalDateTime nextRetryAt(int attempts) {
        int minutes = Math.min(60, (int) Math.pow(2, Math.max(1, attempts)));
        return LocalDateTime.now().plusMinutes(minutes);
    }

    private List<String> resolveRecipients(List<String> incoming) {
        if (incoming != null && !incoming.isEmpty()) {
            return incoming.stream().filter((x) -> x != null && !x.isBlank()).map(String::trim).toList();
        }
        return Arrays.stream((defaultRecipients == null ? "" : defaultRecipients).split(","))
                .map(String::trim)
                .filter((x) -> !x.isBlank())
                .toList();
    }

    private static List<String> parseRecipients(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter((x) -> !x.isBlank())
                .toList();
    }

    private static void validateRecipients(List<String> recipients) {
        if (recipients == null || recipients.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Aucun destinataire");
        }
        List<String> invalid = new ArrayList<>();
        for (String r : recipients) {
            if (!isValidEmail(r)) invalid.add(r);
        }
        if (!invalid.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Emails invalides: " + String.join(", ", invalid));
        }
    }

    private static boolean isValidEmail(String email) {
        if (email == null) return false;
        String e = email.trim().toLowerCase(Locale.ROOT);
        if (e.isBlank()) return false;
        try {
            InternetAddress addr = new InternetAddress(e, true);
            addr.validate();
            return true;
        } catch (Exception ex) {
            return false;
        }
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

    private BackofficeMessageDto toDto(BackofficeMessage m) {
        List<String> recipients = parseRecipients(m.getRecipients());
        return new BackofficeMessageDto(
                m.getId(),
                m.getSubject(),
                m.getBody(),
                recipients,
                m.getStatus(),
                m.getAttempts(),
                m.getLastError(),
                m.getNextRetryAt(),
                m.getSentAt(),
                m.getCreatedAt(),
                m.getCreatedBy()
        );
    }
}

