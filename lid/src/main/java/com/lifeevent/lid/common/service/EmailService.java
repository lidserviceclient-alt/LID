package com.lifeevent.lid.common.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${config.mail.from:no-reply@lid.local}")
    private String fromEmail;

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    public void send(String to, String subject, String body) {
        if (isLocal()) {
            log.info("Mail local to={} subject={} body={}", to, subject, body);
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom(fromEmail);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public void sendHtml(String to, String subject, String htmlBody) {
        if (isLocal()) {
            log.info("Mail HTML local to={} subject={}", to, subject);
        }
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(to);
            helper.setFrom(fromEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            log.warn("Échec envoi email HTML to={} subject={}: {}", to, subject, e.getMessage());
            send(to, subject, stripHtml(htmlBody));
        }
    }

    private boolean isLocal() {
        return activeProfile != null && activeProfile.contains("local");
    }

    private String stripHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]+>", "").replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<").replaceAll("&gt;", ">")
                .replaceAll("&quot;", "\"").replaceAll("&#39;", "'")
                .replaceAll("&nbsp;", " ").replaceAll("\\s{2,}", " ").trim();
    }
}
