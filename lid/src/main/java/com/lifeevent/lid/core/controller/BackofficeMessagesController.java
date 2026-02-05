package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.BackofficeMessageDto;
import com.lifeevent.lid.core.dto.CreateBackofficeMessageRequest;
import com.lifeevent.lid.core.service.BackofficeMessageService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/backoffice/messages")
public class BackofficeMessagesController {

    private final BackofficeMessageService messageService;

    public BackofficeMessagesController(BackofficeMessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    public Page<BackofficeMessageDto> list(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return messageService.list(pageable);
    }

    @GetMapping("/{id}")
    public BackofficeMessageDto get(@PathVariable String id) {
        return messageService.get(id);
    }

    @PostMapping
    public BackofficeMessageDto create(@Valid @RequestBody CreateBackofficeMessageRequest request) {
        return messageService.createAndSend(request);
    }

    @PostMapping("/{id}/retry")
    public BackofficeMessageDto retry(@PathVariable String id) {
        return messageService.retry(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        messageService.delete(id);
    }
}

