package com.lifeevent.lid.backoffice.lid.notification.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeNotificationActivityDto {
    private String id;
    private String actor;
    private String method;
    private String path;
    private Integer status;
    private String summary;
    private LocalDateTime createdAt;
}
