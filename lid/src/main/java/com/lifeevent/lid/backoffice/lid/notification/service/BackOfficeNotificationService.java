package com.lifeevent.lid.backoffice.lid.notification.service;

import com.lifeevent.lid.backoffice.lid.notification.dto.BackOfficeNotificationDto;
import com.lifeevent.lid.backoffice.lid.notification.dto.CreateBackOfficeNotificationRequest;
import org.springframework.data.domain.Page;

public interface BackOfficeNotificationService {
    Page<BackOfficeNotificationDto> getNotifications(int page, int size);
    long getUnreadCount();
    void markAsRead(String notificationId);
    void markAllAsRead();
    void create(CreateBackOfficeNotificationRequest request);
}
