package com.lifeevent.lid.backoffice.lid.notification.controller;

import com.lifeevent.lid.backoffice.lid.notification.dto.BackOfficeNotificationDto;
import com.lifeevent.lid.backoffice.lid.notification.service.BackOfficeNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/backoffice/notifications")
@RequiredArgsConstructor
public class BackOfficeNotificationController implements IBackOfficeNotificationController {

    private final BackOfficeNotificationService backOfficeNotificationService;

    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeNotificationDto>> getNotifications(int page, int size) {
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(backOfficeNotificationService.getNotifications(page, size)));
    }

    @Override
    public ResponseEntity<Long> getUnreadNotificationsCount() {
        return ResponseEntity.ok(backOfficeNotificationService.getUnreadCount());
    }

    @Override
    public ResponseEntity<Void> markAsRead(String id) {
        backOfficeNotificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> markAllAsRead() {
        backOfficeNotificationService.markAllAsRead();
        return ResponseEntity.noContent().build();
    }
}
