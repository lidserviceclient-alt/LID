package com.lifeevent.lid.core.dto;

import java.time.LocalDateTime;

public record TeamMemberPerformanceDto(
        String actor,
        String name,
        String role,
        long tasksCompleted,
        long errors,
        double successRate,
        LocalDateTime lastActiveAt
) {
}

