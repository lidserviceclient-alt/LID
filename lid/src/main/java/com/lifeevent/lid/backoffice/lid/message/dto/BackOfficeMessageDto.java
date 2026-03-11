package com.lifeevent.lid.backoffice.lid.message.dto;

import com.lifeevent.lid.message.enumeration.MessageStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeMessageDto {
    private Long id;
    private String subject;
    private String body;
    private List<String> recipients;
    private MessageStatus status;
    private Integer attemptCount;
    private String lastError;
    private LocalDateTime nextRetryAt;
    private LocalDateTime sentAt;
    private LocalDateTime createdAt;
    private String createdBy;
}
