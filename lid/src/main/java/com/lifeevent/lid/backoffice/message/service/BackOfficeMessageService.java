package com.lifeevent.lid.backoffice.message.service;

import com.lifeevent.lid.backoffice.message.dto.BackOfficeMessageDto;
import com.lifeevent.lid.backoffice.message.dto.CreateBackOfficeMessageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeMessageService {
    Page<BackOfficeMessageDto> getAll(Pageable pageable);
    BackOfficeMessageDto create(CreateBackOfficeMessageRequest request);
    BackOfficeMessageDto retry(Long id);
    void delete(Long id);
}
