package com.lifeevent.lid.backoffice.lid.setting.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "backoffice_notification_preference")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class BackOfficeNotificationPreferenceEntity extends BaseEntity {

    @Id
    @Column(name = "pref_key", length = 128)
    private String key;

    private String label;

    @Column(nullable = false)
    private Boolean enabled;
}
