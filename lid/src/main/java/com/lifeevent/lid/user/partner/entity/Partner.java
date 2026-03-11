package com.lifeevent.lid.user.partner.entity;

import com.lifeevent.lid.user.common.entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Entité Partner - Vendeur/Commerçant
 * Hérite de UserEntity (userId, email, firstName, lastName, emailVerified)
 * Ajoute uniquement les champs spécifiques au Partner
 */
@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@DiscriminatorValue("PARTNER")
@PrimaryKeyJoinColumn(name = "user_id")
public class Partner extends UserEntity {
    
    /**
     * ÉTAPE 1 - Compte
     * phoneNumber est spécifique au Partner (pas dans UserEntity)
     */
    @Column(length = 20)
    private String phoneNumber;
    
    /**
     * Password hashé (spécifique au Partner qui peut se connecter localement)
     * Note: Google OAuth2 crée un Partner sans password
     */
    @Column(length = 255)
    private String passwordHash;
    
    /**
     * ÉTAPE 2 - Boutique
     * OneToOne bidirectionnel avec Shop
     */
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "shop_id", unique = true)
    private Shop shop;
    
    /**
     * ÉTAPE 3 - Vérification légale
     */
    @Column(length = 500)
    private String headOfficeAddress;
    
    @Column(length = 100)
    private String city;
    
    @Column(length = 100)
    private String country;

    @Column(length = 64)
    private String ninea;

    @Column(length = 128)
    private String rccm;
    
    /**
     * URL du document de registration commercial
     * Stocké comme URL, pas comme fichier
     */
    @Column(length = 1000)
    private String businessRegistrationDocumentUrl;

    @Column(length = 255)
    private String bankName;

    @Column(length = 255)
    private String accountHolder;

    @Column(length = 128)
    private String rib;

    @Column(length = 128)
    private String iban;

    @Column(length = 128)
    private String swift;

    @Column(nullable = false)
    @Builder.Default
    private Boolean contractAccepted = false;

    @Column(length = 1000)
    private String idDocumentUrl;

    @Column(length = 1000)
    private String nineaDocumentUrl;

    @Column(length = 1000)
    private String supportingDocumentsZipUrl;
    
    /**
     * Statut d'enregistrement pour tracker la progression du Partner
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PartnerRegistrationStatus registrationStatus = PartnerRegistrationStatus.STEP_1_PENDING;
}
