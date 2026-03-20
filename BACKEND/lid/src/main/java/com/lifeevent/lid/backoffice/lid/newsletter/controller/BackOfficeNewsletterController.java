package com.lifeevent.lid.backoffice.lid.newsletter.controller;

import com.lifeevent.lid.backoffice.lid.newsletter.dto.BackOfficeNewsletterStatsDto;
import com.lifeevent.lid.backoffice.lid.newsletter.dto.BackOfficeNewsletterSubscribeRequest;
import com.lifeevent.lid.backoffice.lid.newsletter.dto.BackOfficeNewsletterSubscriberDto;
import com.lifeevent.lid.backoffice.lid.newsletter.service.BackOfficeNewsletterService;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/backoffice/marketing/newsletter", "/api/backoffice/marketing/newsletter"})
@RequiredArgsConstructor
public class BackOfficeNewsletterController implements IBackOfficeNewsletterController {

    private final BackOfficeNewsletterService backOfficeNewsletterService;

    @Override
    public ResponseEntity<BackOfficeNewsletterStatsDto> getStats() {
        return ResponseEntity.ok(backOfficeNewsletterService.getStats());
    }

    @Override
    public ResponseEntity<Page<BackOfficeNewsletterSubscriberDto>> getSubscribers(NewsletterSubscriberStatus status, String q, int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(size, 1), 200), Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(backOfficeNewsletterService.getSubscribers(status, q, pageable));
    }

    @Override
    public ResponseEntity<BackOfficeNewsletterSubscriberDto> createSubscriber(BackOfficeNewsletterSubscribeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeNewsletterService.createSubscriber(request.getEmail()));
    }

    @Override
    public ResponseEntity<Void> deleteSubscriber(String id) {
        backOfficeNewsletterService.deleteSubscriber(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<BackOfficeNewsletterSubscriberDto> unsubscribe(String id) {
        return ResponseEntity.ok(backOfficeNewsletterService.unsubscribe(id));
    }
}
