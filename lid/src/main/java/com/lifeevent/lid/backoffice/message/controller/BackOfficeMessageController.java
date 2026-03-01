package com.lifeevent.lid.backoffice.message.controller;

import com.lifeevent.lid.backoffice.message.dto.BackOfficeMessageDto;
import com.lifeevent.lid.backoffice.message.dto.CreateBackOfficeMessageRequest;
import com.lifeevent.lid.backoffice.message.service.BackOfficeMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/backoffice/messages", "/api/backoffice/messages"})
@RequiredArgsConstructor
public class BackOfficeMessageController implements IBackOfficeMessageController {

    private final BackOfficeMessageService backOfficeMessageService;

    @Override
    public ResponseEntity<Page<BackOfficeMessageDto>> getAll(int page, int size) {
        return ResponseEntity.ok(
                backOfficeMessageService.getAll(
                        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
                )
        );
    }

    @Override
    public ResponseEntity<BackOfficeMessageDto> getById(Long id) {
        return ResponseEntity.ok(backOfficeMessageService.getById(id));
    }

    @Override
    public ResponseEntity<BackOfficeMessageDto> create(CreateBackOfficeMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeMessageService.create(request));
    }

    @Override
    public ResponseEntity<BackOfficeMessageDto> retry(Long id) {
        return ResponseEntity.ok(backOfficeMessageService.retry(id));
    }

    @Override
    public ResponseEntity<Void> delete(Long id) {
        backOfficeMessageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
