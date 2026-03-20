package com.lifeevent.lid.auth.config;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@Configuration
@Profile({"local-h2"})
@Slf4j
public class LocalMailConfig {

    @Bean
    public JavaMailSender javaMailSender() {
        return new JavaMailSender() {
            @Override
            public MimeMessage createMimeMessage() {
                return new MimeMessage((jakarta.mail.Session) null);
            }

            @Override
            public MimeMessage createMimeMessage(java.io.InputStream contentStream) {
                return createMimeMessage();
            }

            @Override
            public void send(MimeMessage mimeMessage) {
                logMime(mimeMessage);
            }

            @Override
            public void send(MimeMessage... mimeMessages) {
                if (mimeMessages == null) return;
                for (MimeMessage msg : mimeMessages) {
                    logMime(msg);
                }
            }

            @Override
            public void send(SimpleMailMessage simpleMessage) {
                if (simpleMessage == null) return;
                log.info("Mail local to={} subject={} body={}",
                        String.join(", ", safeArray(simpleMessage.getTo())),
                        simpleMessage.getSubject(),
                        simpleMessage.getText());
            }

            @Override
            public void send(SimpleMailMessage... simpleMessages) {
                if (simpleMessages == null) return;
                for (SimpleMailMessage msg : simpleMessages) {
                    if (msg == null) continue;
                    log.info("Mail local to={} subject={} body={}",
                            String.join(", ", safeArray(msg.getTo())),
                            msg.getSubject(),
                            msg.getText());
                }
            }
        };
    }

    private void logMime(MimeMessage msg) {
        if (msg == null) {
            return;
        }
        log.info("Mail local mime recu");
    }

    private String[] safeArray(String[] values) {
        return values == null ? new String[0] : values;
    }
}
