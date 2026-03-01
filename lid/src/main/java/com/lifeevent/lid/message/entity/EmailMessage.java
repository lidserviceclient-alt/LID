package com.lifeevent.lid.message.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.message.enumeration.MessageStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "email_message")
public class EmailMessage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, length = 10000)
    private String body;

    @ElementCollection
    @CollectionTable(name = "email_message_recipient", joinColumns = @JoinColumn(name = "message_id"))
    @Column(name = "recipient", nullable = false)
    @Builder.Default
    private List<String> recipients = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MessageStatus status = MessageStatus.PENDING;

    @Column(nullable = false)
    @Builder.Default
    private Integer attemptCount = 0;

    @Column(length = 2000)
    private String lastError;

    private LocalDateTime nextRetryAt;

    private LocalDateTime sentAt;
}
