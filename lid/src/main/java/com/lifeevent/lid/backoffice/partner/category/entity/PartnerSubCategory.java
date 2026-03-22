package com.lifeevent.lid.backoffice.partner.category.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
        name = "partner_sub_category",
        indexes = {
                @Index(name = "idx_partner_sub_category_partner", columnList = "partner_id"),
                @Index(name = "idx_partner_sub_category_partner_main", columnList = "partner_id, main_category_id")
        }
)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PartnerSubCategory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "partner_id", nullable = false)
    private String partnerId;

    @Column(name = "main_category_id", nullable = false)
    private Integer mainCategoryId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;
}
