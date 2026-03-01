package com.lifeevent.lid.backoffice.notification.controller;

import com.lifeevent.lid.backoffice.notification.dto.BackOfficeNotificationActivityDto;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

public interface IBackOfficeNotificationController {

    @GetMapping
    ResponseEntity<Page<BackOfficeNotificationActivityDto>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String since
    );

    @GetMapping("/count")
    ResponseEntity<Long> getNotificationsCount(
            @RequestParam(required = false) String since
    );
}
