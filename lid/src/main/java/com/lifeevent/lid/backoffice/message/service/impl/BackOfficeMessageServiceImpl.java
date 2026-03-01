package com.lifeevent.lid.backoffice.message.service.impl;

import com.lifeevent.lid.backoffice.message.dto.BackOfficeMessageDto;
import com.lifeevent.lid.backoffice.message.dto.CreateBackOfficeMessageRequest;
import com.lifeevent.lid.backoffice.message.mapper.BackOfficeMessageMapper;
import com.lifeevent.lid.backoffice.message.service.BackOfficeMessageService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.message.entity.EmailMessage;
import com.lifeevent.lid.message.enumeration.MessageStatus;
import com.lifeevent.lid.message.repository.EmailMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.InternetAddress;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeMessageServiceImpl implements BackOfficeMessageService {
    private static final int MAX_RETRY_ATTEMPTS = 5;

    private final EmailMessageRepository emailMessageRepository;
    private final BackOfficeMessageMapper backOfficeMessageMapper;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${config.backoffice.messages.default-recipients}")
    private String defaultRecipients;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeMessageDto> getAll(Pageable pageable) {
        return emailMessageRepository.findAll(pageable).map(backOfficeMessageMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeMessageDto getById(Long id) {
        return backOfficeMessageMapper.toDto(findByIdOrThrow(id));
    }

    @Override
    public BackOfficeMessageDto create(CreateBackOfficeMessageRequest request) {
        EmailMessage entity = buildMessageFromRequest(request);
        processSending(entity);
        EmailMessage saved = emailMessageRepository.save(entity);
        return backOfficeMessageMapper.toDto(saved);
    }

    @Override
    public BackOfficeMessageDto retry(Long id) {
        EmailMessage entity = findByIdOrThrow(id);
        processSending(entity);
        EmailMessage saved = emailMessageRepository.save(entity);
        return backOfficeMessageMapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!emailMessageRepository.existsById(id)) {
            throw new ResourceNotFoundException("EmailMessage", "id", id.toString());
        }
        emailMessageRepository.deleteById(id);
    }

    @Scheduled(fixedDelayString = "${config.backoffice.messages.retry-delay-ms:60000}")
    public void retryFailedMessages() {
        LocalDateTime now = LocalDateTime.now();
        List<EmailMessage> dueMessages = emailMessageRepository
                .findByStatusAndNextRetryAtBeforeOrderByNextRetryAtAsc(MessageStatus.FAILED, now);

        for (EmailMessage message : dueMessages) {
            Integer attempts = message.getAttemptCount() == null ? 0 : message.getAttemptCount();
            if (attempts >= MAX_RETRY_ATTEMPTS) {
                continue;
            }
            processSending(message);
            emailMessageRepository.save(message);
        }
    }

    private EmailMessage buildMessageFromRequest(CreateBackOfficeMessageRequest request) {
        return EmailMessage.builder()
                .subject(request != null ? safeTrim(request.getSubject()) : null)
                .body(request != null ? safeTrim(request.getBody()) : null)
                .recipients(resolveRecipients(request != null ? request.getRecipients() : null))
                .status(MessageStatus.PENDING)
                .attemptCount(0)
                .build();
    }

    private void processSending(EmailMessage entity) {
        prepareAttempt(entity);

        String validationError = validateBeforeSend(entity);
        if (validationError != null) {
            markFailed(entity, validationError);
            return;
        }

        sendWithSmtp(entity);
    }

    private void prepareAttempt(EmailMessage entity) {
        entity.setAttemptCount((entity.getAttemptCount() == null ? 0 : entity.getAttemptCount()) + 1);
        entity.setSentAt(null);
        entity.setLastError(null);
        entity.setNextRetryAt(null);
        entity.setStatus(MessageStatus.PENDING);
        entity.setSubject(safeTrim(entity.getSubject()));
        entity.setBody(safeTrim(entity.getBody()));
        entity.setRecipients(normalizeRecipients(entity.getRecipients()));
    }

    private String validateBeforeSend(EmailMessage entity) {
        if (entity.getSubject() == null || entity.getSubject().isEmpty()) {
            return "Sujet obligatoire.";
        }
        if (entity.getBody() == null || entity.getBody().isEmpty()) {
            return "Contenu du message obligatoire.";
        }
        List<String> recipients = entity.getRecipients();
        if (recipients == null || recipients.isEmpty()) {
            return "Au moins un destinataire est requis.";
        }
        for (String r : recipients) {
            if (!isValidEmail(r)) {
                return "Adresse email invalide: " + r;
            }
        }
        return null;
    }

    private void sendWithSmtp(EmailMessage entity) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (isNotBlank(fromAddress)) {
                message.setFrom(fromAddress);
            }
            message.setTo(entity.getRecipients().toArray(new String[0]));
            message.setSubject(entity.getSubject());
            message.setText(entity.getBody());
            mailSender.send(message);

            markSent(entity);
        } catch (Exception e) {
            markFailed(entity, e.getMessage() == null ? "Échec d'envoi SMTP." : e.getMessage());
        }
    }

    private void markSent(EmailMessage entity) {
        entity.setStatus(MessageStatus.SENT);
        entity.setSentAt(LocalDateTime.now());
        entity.setLastError(null);
    }

    private void markFailed(EmailMessage entity, String error) {
        entity.setStatus(MessageStatus.FAILED);
        entity.setLastError(error);
        entity.setNextRetryAt(computeNextRetryAt(entity.getAttemptCount()));
    }

    private LocalDateTime computeNextRetryAt(Integer attempts) {
        int safeAttempts = Math.max(1, attempts == null ? 1 : attempts);
        int minutes = Math.min(60, (int) Math.pow(2, safeAttempts));
        return LocalDateTime.now().plusMinutes(minutes);
    }

    private List<String> resolveRecipients(List<String> recipients) {
        List<String> normalizedInput = normalizeRecipients(recipients);
        if (!normalizedInput.isEmpty()) {
            return normalizedInput;
        }
        return parseDefaultRecipients();
    }

    private List<String> parseDefaultRecipients() {
        if (!isNotBlank(defaultRecipients)) {
            return List.of();
        }
        return Arrays.stream(defaultRecipients.split(","))
                .map(this::safeTrim)
                .filter(this::isNotBlank)
                .toList();
    }

    private List<String> normalizeRecipients(List<String> recipients) {
        List<String> out = new ArrayList<>();
        if (recipients == null) return out;
        for (String r : recipients) {
            String v = safeTrim(r);
            if (isNotBlank(v)) out.add(v);
        }
        return out;
    }

    private String safeTrim(String value) {
        return value == null ? null : value.trim();
    }

    private boolean isNotBlank(String value) {
        return value != null && !value.isEmpty();
    }

    private boolean isValidEmail(String email) {
        if (email == null) {
            return false;
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        if (normalized.isEmpty()) {
            return false;
        }
        try {
            InternetAddress internetAddress = new InternetAddress(normalized, true);
            internetAddress.validate();
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private EmailMessage findByIdOrThrow(Long id) {
        return emailMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmailMessage", "id", id.toString()));
    }
}
