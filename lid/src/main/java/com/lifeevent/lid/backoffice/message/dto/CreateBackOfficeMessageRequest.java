package com.lifeevent.lid.backoffice.message.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBackOfficeMessageRequest {
    private String subject;
    private String body;
    private List<String> recipients;
}
