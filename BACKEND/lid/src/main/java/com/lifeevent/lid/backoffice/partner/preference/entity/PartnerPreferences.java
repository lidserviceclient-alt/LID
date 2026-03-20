package com.lifeevent.lid.backoffice.partner.preference.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "partner_preferences")
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PartnerPreferences extends BaseEntity {

    @Id
    @Column(name = "partner_id", nullable = false)
    private String partnerId;

    @Column(name = "stock_threshold")
    private Integer stockThreshold;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "instagram_handle")
    private String instagramHandle;

    @Column(name = "facebook_page")
    private String facebookPage;

    @Column(name = "opening_hours_json", columnDefinition = "TEXT")
    private String openingHoursJson;
}

