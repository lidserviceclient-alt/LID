package com.lifeevent.lid.user.partner.entity;

import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Entité Shop - Boutique d'un Partner (vendeur)
 */
@Entity
@Table(name = "shop")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Shop extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long shopId;
    
    @Column(nullable = false)
    private String shopName;
    
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "main_category_id", nullable = false)
    private Category mainCategory;
    
    @Column(length = 1000)
    private String shopDescription;
    
    /**
     * Relation bidirectionnelle avec Partner
     * Un Shop ne peut appartenir qu'à un Partner
     * Utiliser mappedBy pour éviter une colonne de jointure supplémentaire
     */
    @OneToOne(fetch = jakarta.persistence.FetchType.LAZY, mappedBy = "shop")
    private Partner partner;
}
