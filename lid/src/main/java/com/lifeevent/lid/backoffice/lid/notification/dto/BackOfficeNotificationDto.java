package com.lifeevent.lid.backoffice.lid.notification.dto;

import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationSeverity;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeNotificationDto {
    private String id;
    private BackOfficeNotificationType type;
    private String title;
    private String body;
    private BackOfficeNotificationSeverity severity;
    private String actionPath;
    private String actionLabel;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
