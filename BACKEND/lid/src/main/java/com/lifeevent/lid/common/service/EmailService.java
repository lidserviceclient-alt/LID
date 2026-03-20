package com.lifeevent.lid.common.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
        boolean isLocal = activeProfile != null && activeProfile.contains("local");
        if (isLocal) {
            log.info("Mail local to={} subject={} body={}", to, subject, body);
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom(fromEmail);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
