package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.BackofficeProductReviewDto;
import com.lifeevent.lid.core.dto.UpdateBackofficeProductReviewRequest;
import com.lifeevent.lid.core.service.BackofficeProductReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/backoffice/product-reviews")
public class BackofficeProductReviewsController {

    private final BackofficeProductReviewService service;

    public BackofficeProductReviewsController(BackofficeProductReviewService service) {
        this.service = service;
    }

    @GetMapping
    public Page<BackofficeProductReviewDto> list(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "productId", required = false) String productId,
            @RequestParam(value = "userId", required = false) String userId,
            @RequestParam(value = "status", required = false) String status
    ) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.min(Math.max(size, 1), 200));
        return service.list(pageable, q, productId, userId, status);
    }

    @GetMapping("/{id}")
    public BackofficeProductReviewDto get(@PathVariable String id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public BackofficeProductReviewDto update(@PathVariable String id, @Valid @RequestBody UpdateBackofficeProductReviewRequest request) {
        return service.update(id, request);
    }

    @PostMapping("/{id}/validate")
    public BackofficeProductReviewDto validate(@PathVariable String id) {
        return service.validate(id);
    }

    @PostMapping("/{id}/unvalidate")
    public BackofficeProductReviewDto unvalidate(@PathVariable String id) {
        return service.unvalidate(id);
    }

    @PostMapping("/{id}/restore")
    public BackofficeProductReviewDto restore(@PathVariable String id) {
        return service.restore(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}

