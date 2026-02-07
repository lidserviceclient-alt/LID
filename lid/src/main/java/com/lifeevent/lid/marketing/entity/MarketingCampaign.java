package com.lifeevent.lid.marketing.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignStatus;
import com.lifeevent.lid.marketing.enumeration.MarketingCampaignType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "marketing_campaign")
public class MarketingCampaign extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MarketingCampaignType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MarketingCampaignStatus status;

    @Column(nullable = false)
    private Integer sent;

    private Double openRate;
    private Double clickRate;
    private Double revenue;
    private Double budgetSpent;
}
