package com.lifeevent.lid.backoffice.lid.notification.entity;

import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationScope;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationSeverity;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationTargetRole;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationType;
import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "backoffice_notification",
        indexes = {
                @Index(name = "idx_backoffice_notification_purge_after_id", columnList = "purge_after,id"),
                @Index(name = "idx_backoffice_notification_scope_role_read_created", columnList = "scope,target_role,read_at,created_at"),
                @Index(name = "idx_backoffice_notification_target_user_read_created", columnList = "target_user_id,read_at,created_at"),
                @Index(name = "idx_backoffice_notification_dedupe", columnList = "dedupe_key")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class BackOfficeNotificationEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private BackOfficeNotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private BackOfficeNotificationScope scope;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32, name = "target_role")
    private BackOfficeNotificationTargetRole targetRole;

    @Column(name = "target_user_id", length = 128)
    private String targetUserId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 1000)
    private String body;

    @Column(name = "action_path", length = 255)
    private String actionPath;

    @Column(name = "action_label", length = 128)
    private String actionLabel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private BackOfficeNotificationSeverity severity;

    @Column(name = "dedupe_key", length = 255)
    private String dedupeKey;

    @Column(name = "payload_json", length = 4000)
    private String payloadJson;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "purge_after", nullable = false)
    private LocalDateTime purgeAfter;
}
