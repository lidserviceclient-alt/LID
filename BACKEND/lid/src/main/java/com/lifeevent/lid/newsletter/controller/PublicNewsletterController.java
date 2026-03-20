package com.lifeevent.lid.newsletter.controller;

import com.lifeevent.lid.newsletter.dto.NewsletterSubscribeRequest;
import com.lifeevent.lid.newsletter.dto.NewsletterSubscriberDto;
import com.lifeevent.lid.newsletter.entity.NewsletterSubscriber;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberSource;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberStatus;
import com.lifeevent.lid.newsletter.repository.NewsletterSubscriberRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Locale;

@RestController
@RequestMapping("/api/v1/newsletter")
@RequiredArgsConstructor
public class PublicNewsletterController {

    private final NewsletterSubscriberRepository newsletterSubscriberRepository;

    @PostMapping("/subscribe")
    public ResponseEntity<NewsletterSubscriberDto> subscribe(@Valid @RequestBody NewsletterSubscribeRequest request) {
        String email = normalizeEmail(request.getEmail());
        NewsletterSubscriber subscriber = newsletterSubscriberRepository.findByEmailIgnoreCase(email)
                .orElseGet(NewsletterSubscriber::new);
        subscriber.setEmail(email);
        subscriber.setStatus(NewsletterSubscriberStatus.SUBSCRIBED);
        subscriber.setSource(NewsletterSubscriberSource.WEBSITE);
        subscriber.setUnsubscribedAt(null);
        NewsletterSubscriber saved = newsletterSubscriberRepository.save(subscriber);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
    }

    @PostMapping("/unsubscribe")
    public ResponseEntity<NewsletterSubscriberDto> unsubscribe(@Valid @RequestBody NewsletterSubscribeRequest request) {
        String email = normalizeEmail(request.getEmail());
        NewsletterSubscriber subscriber = newsletterSubscriberRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("Abonné introuvable"));
        subscriber.setStatus(NewsletterSubscriberStatus.UNSUBSCRIBED);
        if (subscriber.getUnsubscribedAt() == null) {
            subscriber.setUnsubscribedAt(LocalDateTime.now());
        }
        NewsletterSubscriber saved = newsletterSubscriberRepository.save(subscriber);
        return ResponseEntity.ok(toDto(saved));
    }

    private NewsletterSubscriberDto toDto(NewsletterSubscriber entity) {
        return NewsletterSubscriberDto.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .status(entity.getStatus())
                .source(entity.getSource())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .unsubscribedAt(entity.getUnsubscribedAt())
                .build();
    }

    private String normalizeEmail(String email) {
        String out = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (out.isBlank()) {
            throw new IllegalArgumentException("Email requis");
        }
        return out;
    }
}
