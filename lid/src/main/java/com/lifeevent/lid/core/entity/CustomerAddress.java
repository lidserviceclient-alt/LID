package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_address")
@Getter
@Setter
public class CustomerAddress extends UuidEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "type", length = 50)
    private String type;

    @Column(name = "name", length = 150)
    private String name;

    @Column(name = "address_line", length = 255)
    private String addressLine;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "date_mise_a_jour")
    private LocalDateTime dateMiseAJour;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (dateCreation == null) {
            dateCreation = now;
        }
        if (dateMiseAJour == null) {
            dateMiseAJour = now;
        }
        if (isDefault == null) {
            isDefault = false;
        }
    }

    @PreUpdate
    void onUpdate() {
        dateMiseAJour = LocalDateTime.now();
        if (isDefault == null) {
            isDefault = false;
        }
    }
}
