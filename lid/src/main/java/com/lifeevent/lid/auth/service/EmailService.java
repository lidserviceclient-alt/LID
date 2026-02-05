package com.lifeevent.lid.auth.service;

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

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    public void sendPasswordResetCode(String to, String code) {
        boolean isLocal = activeProfile != null && activeProfile.contains("local");
        if (isLocal) {
            log.info("Reset code (dev) for {}: {}", to, code);
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom(fromEmail);
        message.setSubject("Code de réinitialisation");
        message.setText("Votre code de réinitialisation est : " + code);
        try {
            mailSender.send(message);
        } catch (Exception ex) {
            if (isLocal) {
                log.warn("Mail not sent in local profile: {}", ex.getMessage());
                return;
            }
            throw ex;
        }
    }
}
