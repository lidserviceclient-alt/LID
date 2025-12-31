package com.lifeevent.lid.order;

import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.sql.Date;
import java.time.LocalDateTime;

//@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class StatusHistory extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDateTime statusDate;
}
