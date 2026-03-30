package com.lifeevent.lid.realtime.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RealtimeTicketResponseDto {
    @JsonProperty("ws-access")
    private String wsAccess;
    private Long ttlSeconds;
    private List<String> topics;
    private String wsPath;
}
