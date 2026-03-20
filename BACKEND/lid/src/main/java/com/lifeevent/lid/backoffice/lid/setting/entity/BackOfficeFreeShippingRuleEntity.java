package com.lifeevent.lid.backoffice.lid.setting.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "backoffice_free_shipping_rule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class BackOfficeFreeShippingRuleEntity extends BaseEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private Double thresholdAmount;

    @Column(length = 2000)
    private String progressMessageTemplate;

    @Column(length = 2000)
    private String unlockedMessage;

    @Column(nullable = false)
    private Boolean enabled;
}
