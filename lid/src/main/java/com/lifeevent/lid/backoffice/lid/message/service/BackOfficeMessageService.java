package com.lifeevent.lid.backoffice.lid.message.service;

import com.lifeevent.lid.backoffice.lid.message.dto.BackOfficeMessageDto;
import com.lifeevent.lid.backoffice.lid.message.dto.CreateBackOfficeMessageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeMessageService {
    Page<BackOfficeMessageDto> getAll(Pageable pageable);
    BackOfficeMessageDto getById(Long id);
    BackOfficeMessageDto create(CreateBackOfficeMessageRequest request);
    BackOfficeMessageDto retry(Long id);
    void delete(Long id);
}
