package com.lifeevent.lid.user.partner.entity;

import com.lifeevent.lid.common.entity.BaseEntity;
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
@Table(
        name = "partner_profile",
        indexes = {
                @Index(name = "idx_partner_registration_status_created_at", columnList = "registration_status, created_at")
        }
)
@Getter
@Setter
@ToString(callSuper = true, exclude = {"user", "shop"})
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Partner extends BaseEntity {

    @Id
    @Column(name = "user_id", length = 128)
    private String userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UserEntity user;
    
    /**
     * ÉTAPE 1 - Compte
     * phoneNumber est spécifique au Partner (pas dans UserEntity)
     */
    @Column(length = 20)
    private String phoneNumber;
    
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

    @Column(length = 2000)
    private String registrationReviewComment;
    
    /**
     * Statut d'enregistrement pour tracker la progression du Partner
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PartnerRegistrationStatus registrationStatus = PartnerRegistrationStatus.STEP_1_PENDING;

    @PrePersist
    @PreUpdate
    private void syncSharedPrimaryKey() {
        if (user == null || user.getUserId() == null || user.getUserId().isBlank()) {
            throw new IllegalStateException("Partner.user must reference a managed UserEntity with non-null userId");
        }
        this.userId = user.getUserId();
    }

    public String getEmail() {
        return user == null ? null : user.getEmail();
    }

    public void setEmail(String email) {
        requireUser().setEmail(email);
    }

    public String getFirstName() {
        return user == null ? null : user.getFirstName();
    }

    public void setFirstName(String firstName) {
        requireUser().setFirstName(firstName);
    }

    public String getLastName() {
        return user == null ? null : user.getLastName();
    }

    public void setLastName(String lastName) {
        requireUser().setLastName(lastName);
    }

    public boolean isEmailVerified() {
        return user != null && user.isEmailVerified();
    }

    public void setEmailVerified(boolean emailVerified) {
        requireUser().setEmailVerified(emailVerified);
    }

    public Boolean getBlocked() {
        return user == null ? Boolean.FALSE : user.getBlocked();
    }

    public void setBlocked(Boolean blocked) {
        requireUser().setBlocked(blocked);
    }

    private UserEntity requireUser() {
        if (user == null) {
            throw new IllegalStateException("Partner.user must be set before updating shared user fields");
        }
        return user;
    }
}
