package com.lifeevent.lid.core.dto;

import java.util.List;

public record TeamProductivityDto(
        long tasksCompleted,
        long errors,
        long activeMembers,
        String topPerformer,
        List<TeamMemberPerformanceDto> performances
) {
}

