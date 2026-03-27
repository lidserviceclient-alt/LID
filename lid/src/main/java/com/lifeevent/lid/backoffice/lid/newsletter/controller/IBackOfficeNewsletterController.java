package com.lifeevent.lid.backoffice.lid.newsletter.controller;

import com.lifeevent.lid.backoffice.lid.newsletter.dto.BackOfficeNewsletterStatsDto;
import com.lifeevent.lid.backoffice.lid.newsletter.dto.BackOfficeNewsletterSubscribeRequest;
import com.lifeevent.lid.backoffice.lid.newsletter.dto.BackOfficeNewsletterSubscriberDto;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberStatus;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

public interface IBackOfficeNewsletterController {

    @GetMapping("/stats")
    ResponseEntity<BackOfficeNewsletterStatsDto> getStats();

    @GetMapping("/subscribers")
    ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeNewsletterSubscriberDto>> getSubscribers(
            @RequestParam(required = false) NewsletterSubscriberStatus status,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @PostMapping("/subscribers")
    ResponseEntity<BackOfficeNewsletterSubscriberDto> createSubscriber(@Valid @RequestBody BackOfficeNewsletterSubscribeRequest request);

    @DeleteMapping("/subscribers/{id}")
    ResponseEntity<Void> deleteSubscriber(@PathVariable String id);

    @PostMapping("/subscribers/{id}/unsubscribe")
    ResponseEntity<BackOfficeNewsletterSubscriberDto> unsubscribe(@PathVariable String id);
}
