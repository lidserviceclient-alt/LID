package com.lifeevent.lid.core.dto;

import com.lifeevent.lid.core.enums.NewsletterSubscriberSource;
import com.lifeevent.lid.core.enums.NewsletterSubscriberStatus;

import java.time.LocalDateTime;

public record NewsletterSubscriberDto(
        String id,
        String email,
        NewsletterSubscriberStatus status,
        NewsletterSubscriberSource source,
        LocalDateTime dateCreation,
        LocalDateTime dateMiseAJour,
        LocalDateTime dateDesabonnement
) {
}

