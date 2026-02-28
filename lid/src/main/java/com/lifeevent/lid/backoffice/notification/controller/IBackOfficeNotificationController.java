package com.lifeevent.lid.backoffice.notification.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

public interface IBackOfficeNotificationController {

    @GetMapping
    ResponseEntity<Map<String, Object>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String since
    );

    @GetMapping("/count")
    ResponseEntity<Long> getNotificationsCount(
            @RequestParam(required = false) String since
    );
}
