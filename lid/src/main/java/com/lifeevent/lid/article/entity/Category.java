package com.lifeevent.lid.article.entity;

import com.lifeevent.lid.article.enumeration.CategoryLevel;
import com.lifeevent.lid.common.entity.BaseEntity;
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
public class Category extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Integer orderIdx;
    @Column(unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CategoryLevel level = CategoryLevel.PRINCIPALE;

    @Builder.Default
    private Boolean isActivated = true;

    private String imageUrl;

    private String slug;

    /**
     * Slug du parent (pour la hiérarchie)
     */
    private String parentSlug;
}
