package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.NewsletterStatsDto;
import com.lifeevent.lid.core.dto.NewsletterSubscriberDto;
import com.lifeevent.lid.core.entity.NewsletterSubscriber;
import com.lifeevent.lid.core.enums.NewsletterSubscriberSource;
import com.lifeevent.lid.core.enums.NewsletterSubscriberStatus;
import com.lifeevent.lid.core.repository.NewsletterSubscriberRepository;
import jakarta.mail.internet.InternetAddress;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Locale;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class NewsletterService {

    private final NewsletterSubscriberRepository newsletterSubscriberRepository;

    public NewsletterService(NewsletterSubscriberRepository newsletterSubscriberRepository) {
        this.newsletterSubscriberRepository = newsletterSubscriberRepository;
    }

    @Transactional
    public NewsletterSubscriberDto subscribe(String rawEmail, NewsletterSubscriberSource source) {
        String email = normalizeEmail(rawEmail);
        validateEmail(email);

        NewsletterSubscriber subscriber = newsletterSubscriberRepository.findByEmailIgnoreCase(email)
                .orElseGet(NewsletterSubscriber::new);

        subscriber.setEmail(email);
        subscriber.setSource(source == null ? NewsletterSubscriberSource.UNKNOWN : source);
        subscriber.setStatus(NewsletterSubscriberStatus.SUBSCRIBED);
        subscriber.setDateDesabonnement(null);

        NewsletterSubscriber saved = newsletterSubscriberRepository.save(subscriber);
        return toDto(saved);
    }

    @Transactional
    public NewsletterSubscriberDto unsubscribe(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        validateEmail(email);

        NewsletterSubscriber subscriber = newsletterSubscriberRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Abonné introuvable"));

        subscriber.setStatus(NewsletterSubscriberStatus.UNSUBSCRIBED);
        if (subscriber.getDateDesabonnement() == null) {
            subscriber.setDateDesabonnement(LocalDateTime.now());
        }
        NewsletterSubscriber saved = newsletterSubscriberRepository.save(subscriber);
        return toDto(saved);
    }

    @Transactional
    public NewsletterSubscriberDto unsubscribeById(String id) {
        NewsletterSubscriber subscriber = newsletterSubscriberRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Abonné introuvable"));
        subscriber.setStatus(NewsletterSubscriberStatus.UNSUBSCRIBED);
        if (subscriber.getDateDesabonnement() == null) {
            subscriber.setDateDesabonnement(LocalDateTime.now());
        }
        NewsletterSubscriber saved = newsletterSubscriberRepository.save(subscriber);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<NewsletterSubscriberDto> listSubscribers(NewsletterSubscriberStatus status, String q, Pageable pageable) {
        String query = (q == null || q.isBlank()) ? null : q.trim();
        return newsletterSubscriberRepository.search(status, query, pageable).map(this::toDto);
    }

    @Transactional
    public void deleteSubscriber(String id) {
        if (!newsletterSubscriberRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Abonné introuvable");
        }
        newsletterSubscriberRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public NewsletterStatsDto stats() {
        long total = newsletterSubscriberRepository.count();
        long subscribed = newsletterSubscriberRepository.countByStatus(NewsletterSubscriberStatus.SUBSCRIBED);
        long unsubscribed = newsletterSubscriberRepository.countByStatus(NewsletterSubscriberStatus.UNSUBSCRIBED);
        return new NewsletterStatsDto(total, subscribed, unsubscribed);
    }

    private NewsletterSubscriberDto toDto(NewsletterSubscriber s) {
        return new NewsletterSubscriberDto(
                s.getId(),
                s.getEmail(),
                s.getStatus(),
                s.getSource(),
                s.getDateCreation(),
                s.getDateMiseAJour(),
                s.getDateDesabonnement()
        );
    }

    private static String normalizeEmail(String rawEmail) {
        return rawEmail == null ? "" : rawEmail.trim().toLowerCase(Locale.ROOT);
    }

    private static void validateEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Email requis");
        }
        try {
            InternetAddress addr = new InternetAddress(email, true);
            addr.validate();
        } catch (Exception ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Email invalide");
        }
    }
}
