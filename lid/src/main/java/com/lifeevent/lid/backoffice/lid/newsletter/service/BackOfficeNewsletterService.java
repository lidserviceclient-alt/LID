package com.lifeevent.lid.backoffice.lid.newsletter.service;

import com.lifeevent.lid.backoffice.lid.newsletter.dto.BackOfficeNewsletterStatsDto;
import com.lifeevent.lid.backoffice.lid.newsletter.dto.BackOfficeNewsletterSubscriberDto;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeNewsletterService {
    BackOfficeNewsletterStatsDto getStats();
    Page<BackOfficeNewsletterSubscriberDto> getSubscribers(NewsletterSubscriberStatus status, String q, Pageable pageable);
    BackOfficeNewsletterSubscriberDto createSubscriber(String email);
    void deleteSubscriber(String id);
    BackOfficeNewsletterSubscriberDto unsubscribe(String id);
}
