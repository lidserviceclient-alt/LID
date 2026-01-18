package com.lifeevent.lid.user.partner.entity;

/**
 * Enum pour tracker l'étape d'enregistrement d'un Partner
 */
public enum PartnerRegistrationStatus {
    STEP_1_PENDING,      // Compte créé, en attente ÉTAPE 2
    STEP_2_PENDING,      // Boutique créée, en attente ÉTAPE 3
    STEP_3_PENDING,      // Infos légales ajoutées, en attente de validation
    VERIFIED,            // Complètement enregistré et vérifié
    REJECTED             // Rejeté par un admin
}
