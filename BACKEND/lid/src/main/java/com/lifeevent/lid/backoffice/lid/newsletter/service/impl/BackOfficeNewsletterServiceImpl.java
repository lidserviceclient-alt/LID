package com.lifeevent.lid.backoffice.lid.newsletter.service.impl;

import com.lifeevent.lid.backoffice.lid.newsletter.dto.BackOfficeNewsletterStatsDto;
import com.lifeevent.lid.backoffice.lid.newsletter.dto.BackOfficeNewsletterSubscriberDto;
import com.lifeevent.lid.backoffice.lid.newsletter.service.BackOfficeNewsletterService;
import com.lifeevent.lid.newsletter.entity.NewsletterSubscriber;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberSource;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberStatus;
import com.lifeevent.lid.newsletter.repository.NewsletterSubscriberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeNewsletterServiceImpl implements BackOfficeNewsletterService {

    private final NewsletterSubscriberRepository newsletterSubscriberRepository;

    @Override
    @Transactional(readOnly = true)
    public BackOfficeNewsletterStatsDto getStats() {
        long total = newsletterSubscriberRepository.count();
        long subscribed = newsletterSubscriberRepository.countByStatus(NewsletterSubscriberStatus.SUBSCRIBED);
        long unsubscribed = newsletterSubscriberRepository.countByStatus(NewsletterSubscriberStatus.UNSUBSCRIBED);

        return BackOfficeNewsletterStatsDto.builder()
                .total(total)
                .subscribed(subscribed)
                .unsubscribed(unsubscribed)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeNewsletterSubscriberDto> getSubscribers(NewsletterSubscriberStatus status, String q, Pageable pageable) {
        String query = normalizeQuery(q);
        return newsletterSubscriberRepository.search(status, query, pageable).map(this::toDto);
    }

    @Override
    public BackOfficeNewsletterSubscriberDto createSubscriber(String email) {
        String safeEmail = normalizeAndValidateEmail(email);

        NewsletterSubscriber subscriber = newsletterSubscriberRepository.findByEmailIgnoreCase(safeEmail)
                .orElseGet(NewsletterSubscriber::new);

        subscriber.setEmail(safeEmail);
        subscriber.setSource(NewsletterSubscriberSource.BACKOFFICE);
        subscriber.setStatus(NewsletterSubscriberStatus.SUBSCRIBED);
        subscriber.setUnsubscribedAt(null);

        NewsletterSubscriber saved = newsletterSubscriberRepository.save(subscriber);
        return toDto(saved);
    }

    @Override
    public void deleteSubscriber(String id) {
        if (!newsletterSubscriberRepository.existsById(id)) {
            throw new IllegalArgumentException("Abonné introuvable");
        }
        newsletterSubscriberRepository.deleteById(id);
    }

    @Override
    public BackOfficeNewsletterSubscriberDto unsubscribe(String id) {
        NewsletterSubscriber subscriber = newsletterSubscriberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Abonné introuvable"));

        subscriber.setStatus(NewsletterSubscriberStatus.UNSUBSCRIBED);
        if (subscriber.getUnsubscribedAt() == null) {
            subscriber.setUnsubscribedAt(LocalDateTime.now());
        }

        NewsletterSubscriber saved = newsletterSubscriberRepository.save(subscriber);
        return toDto(saved);
    }

    private BackOfficeNewsletterSubscriberDto toDto(NewsletterSubscriber entity) {
        return BackOfficeNewsletterSubscriberDto.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .status(entity.getStatus())
                .source(entity.getSource())
                .dateCreation(entity.getCreatedAt())
                .dateMiseAJour(entity.getUpdatedAt())
                .dateDesabonnement(entity.getUnsubscribedAt())
                .build();
    }

    private String normalizeQuery(String q) {
        if (q == null) {
            return null;
        }
        String trimmed = q.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeAndValidateEmail(String email) {
        String safe = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (safe.isBlank()) {
            throw new IllegalArgumentException("Email requis");
        }
        if (!safe.contains("@") || safe.startsWith("@") || safe.endsWith("@")) {
            throw new IllegalArgumentException("Email invalide");
        }
        return safe;
    }
}
