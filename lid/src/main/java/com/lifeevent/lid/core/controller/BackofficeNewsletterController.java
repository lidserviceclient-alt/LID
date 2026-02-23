package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.NewsletterStatsDto;
import com.lifeevent.lid.core.dto.NewsletterSubscribeRequest;
import com.lifeevent.lid.core.dto.NewsletterSubscriberDto;
import com.lifeevent.lid.core.enums.NewsletterSubscriberSource;
import com.lifeevent.lid.core.enums.NewsletterSubscriberStatus;
import com.lifeevent.lid.core.service.NewsletterService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/backoffice/marketing/newsletter")
public class BackofficeNewsletterController {

    private final NewsletterService newsletterService;

    public BackofficeNewsletterController(NewsletterService newsletterService) {
        this.newsletterService = newsletterService;
    }

    @GetMapping("/stats")
    public NewsletterStatsDto stats() {
        return newsletterService.stats();
    }

    @GetMapping("/subscribers")
    public Page<NewsletterSubscriberDto> list(
            @RequestParam(value = "status", required = false) NewsletterSubscriberStatus status,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateCreation"));
        return newsletterService.listSubscribers(status, q, pageable);
    }

    @PostMapping("/subscribers")
    public ResponseEntity<NewsletterSubscriberDto> create(@Valid @RequestBody NewsletterSubscribeRequest request) {
        NewsletterSubscriberDto dto = newsletterService.subscribe(request.getEmail(), NewsletterSubscriberSource.BACKOFFICE);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @DeleteMapping("/subscribers/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        newsletterService.deleteSubscriber(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/subscribers/{id}/unsubscribe")
    public ResponseEntity<NewsletterSubscriberDto> unsubscribe(@PathVariable String id) {
        NewsletterSubscriberDto dto = newsletterService.unsubscribeById(id);
        return ResponseEntity.ok(dto);
    }
}
