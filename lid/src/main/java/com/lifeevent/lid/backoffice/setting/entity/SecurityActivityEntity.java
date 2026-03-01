package com.lifeevent.lid.backoffice.setting.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "security_activity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class SecurityActivityEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime eventAt;

    @Column(length = 128)
    private String userId;

    @Column(nullable = false, length = 128)
    private String action;

    @Column(nullable = false, length = 64)
    private String status;

    @Column(length = 128)
    private String ip;

    @Column(length = 16)
    private String method;

    @Column(length = 255)
    private String path;

    @Column(length = 512)
    private String summary;
}
