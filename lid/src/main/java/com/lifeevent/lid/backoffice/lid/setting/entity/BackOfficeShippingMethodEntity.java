package com.lifeevent.lid.backoffice.lid.setting.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "backoffice_shipping_method")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class BackOfficeShippingMethodEntity extends BaseEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String label;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private Double costAmount;

    @Column(length = 16, nullable = false)
    private String leadTimeUnit;

    @Column(nullable = false)
    private Integer leadTimeMin;

    @Column(nullable = false)
    private Integer leadTimeMax;

    @Column(nullable = false)
    private Boolean enabled;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    private Integer sortOrder;
}
