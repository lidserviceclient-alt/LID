package com.lifeevent.lid.backoffice.lid.notification.controller;

import com.lifeevent.lid.backoffice.lid.notification.dto.BackOfficeNotificationDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

public interface IBackOfficeNotificationController {

    @GetMapping
    ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeNotificationDto>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    @GetMapping("/unread-count")
    ResponseEntity<Long> getUnreadNotificationsCount();

    @PostMapping("/{id}/read")
    ResponseEntity<Void> markAsRead(@PathVariable String id);

    @PostMapping("/read-all")
    ResponseEntity<Void> markAllAsRead();
}
