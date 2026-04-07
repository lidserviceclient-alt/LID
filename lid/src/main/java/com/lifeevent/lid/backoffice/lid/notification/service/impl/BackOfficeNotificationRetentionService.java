package com.lifeevent.lid.backoffice.lid.notification.service.impl;

import com.lifeevent.lid.backoffice.lid.notification.repository.BackOfficeNotificationRepository;
import com.lifeevent.lid.backoffice.lid.setting.repository.SecurityActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BackOfficeNotificationRetentionService {

    private final BackOfficeNotificationRepository notificationRepository;
    private final SecurityActivityRepository securityActivityRepository;

    @Value("${config.notifications.retention.notifications-batch-size:500}")
    private int notificationsBatchSize;

    @Value("${config.notifications.retention.notifications-max-batches-per-run:10}")
    private int notificationsMaxBatchesPerRun;

    @Value("${config.notifications.retention.security-activity-batch-size:500}")
    private int securityActivityBatchSize;

    @Value("${config.notifications.retention.security-activity-max-age-days:30}")
    private int securityActivityMaxAgeDays;

    @Value("${config.notifications.retention.security-activity-max-batches-per-run:10}")
    private int securityActivityMaxBatchesPerRun;

    @Scheduled(fixedDelayString = "${config.notifications.retention.notifications-purge-delay-ms:300000}")
    @Transactional
    public void purgeExpiredNotifications() {
        purgeNotificationsInternal();
    }

    @Scheduled(fixedDelayString = "${config.notifications.retention.security-activity-purge-delay-ms:21600000}")
    @Transactional
    public void purgeExpiredSecurityActivities() {
        purgeSecurityActivityInternal();
    }

    private void purgeNotificationsInternal() {
        LocalDateTime cutoff = LocalDateTime.now();
        for (int batch = 0; batch < Math.max(1, notificationsMaxBatchesPerRun); batch++) {
            List<Long> ids = notificationRepository.findIdsToPurge(
                    cutoff,
                    PageRequest.of(0, Math.max(1, notificationsBatchSize))
            );
            if (ids.isEmpty()) {
                return;
            }
            notificationRepository.deleteAllByIdInBatch(ids);
            if (ids.size() < Math.max(1, notificationsBatchSize)) {
                return;
            }
        }
    }

    private void purgeSecurityActivityInternal() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(Math.max(1, securityActivityMaxAgeDays));
        for (int batch = 0; batch < Math.max(1, securityActivityMaxBatchesPerRun); batch++) {
            List<Long> ids = securityActivityRepository.findIdsByEventAtBeforeOrderByEventAtAsc(
                    cutoff,
                    PageRequest.of(0, Math.max(1, securityActivityBatchSize))
            );
            if (ids.isEmpty()) {
                return;
            }
            securityActivityRepository.deleteAllByIdInBatch(ids);
            if (ids.size() < Math.max(1, securityActivityBatchSize)) {
                return;
            }
        }
    }
}
