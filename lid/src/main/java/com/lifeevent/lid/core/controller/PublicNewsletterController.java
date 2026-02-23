package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.NewsletterSubscribeRequest;
import com.lifeevent.lid.core.dto.NewsletterSubscriberDto;
import com.lifeevent.lid.core.enums.NewsletterSubscriberSource;
import com.lifeevent.lid.core.service.NewsletterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/newsletter")
public class PublicNewsletterController {

    private final NewsletterService newsletterService;

    public PublicNewsletterController(NewsletterService newsletterService) {
        this.newsletterService = newsletterService;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<NewsletterSubscriberDto> subscribe(@Valid @RequestBody NewsletterSubscribeRequest request) {
        NewsletterSubscriberDto dto = newsletterService.subscribe(request.getEmail(), NewsletterSubscriberSource.WEBSITE);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PostMapping("/unsubscribe")
    public ResponseEntity<NewsletterSubscriberDto> unsubscribe(@Valid @RequestBody NewsletterSubscribeRequest request) {
        NewsletterSubscriberDto dto = newsletterService.unsubscribe(request.getEmail());
        return ResponseEntity.ok(dto);
    }
}

