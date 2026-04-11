package com.lifeevent.lid.backoffice.lid.setting.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "backoffice_app_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class BackOfficeAppConfigEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String storeName;
    private String contactEmail;
    private String contactPhone;
    private String city;
    private String logoUrl;
    private String slogan;
    private String activitySector;

    @Column(length = 2000)
    private String shippingPolicyNote;

    @Column(length = 2000)
    private String returnPolicyText;
}
