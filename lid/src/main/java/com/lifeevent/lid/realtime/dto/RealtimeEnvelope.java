package com.lifeevent.lid.realtime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RealtimeEnvelope {
    private String eventId;
    private String eventType;
    private String topic;
    private LocalDateTime occurredAt;
    private Integer version;
    private Map<String, Object> payload;
}
