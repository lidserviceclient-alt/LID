package com.lifeevent.lid.auth.config;

import jakarta.mail.Address;
import jakarta.mail.Message;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@Configuration
@Profile({"local", "LOCAL", "local-h2"})
public class LocalMailConfig {

    private static final Logger log = LoggerFactory.getLogger(LocalMailConfig.class);

    @Bean
    public JavaMailSender javaMailSender() {
        return new JavaMailSender() {
            @Override
            public MimeMessage createMimeMessage() {
                return new jakarta.mail.internet.MimeMessage((jakarta.mail.Session) null);
            }

            @Override
            public MimeMessage createMimeMessage(java.io.InputStream contentStream) {
                try {
                    return new jakarta.mail.internet.MimeMessage((jakarta.mail.Session) null, contentStream);
                } catch (Exception ex) {
                    return createMimeMessage();
                }
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
                log.info("Mail local to={} subject={} body={}", String.join(", ", safeArray(simpleMessage.getTo())), simpleMessage.getSubject(), simpleMessage.getText());
            }

            @Override
            public void send(SimpleMailMessage... simpleMessages) {
                if (simpleMessages == null) return;
                for (SimpleMailMessage msg : simpleMessages) {
                    if (msg == null) continue;
                    log.info("Mail local to={} subject={} body={}", String.join(", ", safeArray(msg.getTo())), msg.getSubject(), msg.getText());
                }
            }
        };
    }

    private static void logMime(MimeMessage msg) {
        if (msg == null) return;
        try {
            Address[] recipients = msg.getRecipients(Message.RecipientType.TO);
            String subject = msg.getSubject();
            String body;
            try {
                Object content = msg.getContent();
                body = content == null ? "" : content.toString();
            } catch (Exception ex) {
                body = "";
            }
            log.info("Mail local to={} subject={} body={}", formatAddresses(recipients), subject, body);
        } catch (Exception ex) {
            log.info("Mail local reçu");
        }
    }

    private static String formatAddresses(Address[] addresses) {
        if (addresses == null || addresses.length == 0) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < addresses.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(addresses[i] == null ? "" : addresses[i].toString());
        }
        return sb.toString();
    }

    private static String[] safeArray(String[] values) {
        return values == null ? new String[0] : values;
    }
}
