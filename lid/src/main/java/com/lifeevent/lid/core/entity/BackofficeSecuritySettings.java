package com.lifeevent.lid.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "backoffice_security_settings")
@Getter
@Setter
public class BackofficeSecuritySettings {

    @Id
    @Column(name = "id", length = 64, nullable = false)
    private String id;

    @Column(name = "admin_2fa_enabled", nullable = false)
    private Boolean admin2faEnabled = true;
}
