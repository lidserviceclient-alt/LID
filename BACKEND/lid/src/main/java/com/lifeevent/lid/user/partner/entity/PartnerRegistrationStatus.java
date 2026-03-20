package com.lifeevent.lid.user.partner.entity;

/**
 * Enum pour tracker l'étape d'enregistrement d'un Partner
 */
public enum PartnerRegistrationStatus {
    STEP_1_PENDING,      // Compte créé, en attente ÉTAPE 2
    STEP_2_PENDING,      // Infos business/légales textuelles enregistrées
    STEP_3_PENDING,      // URLs médias/documents enregistrées
    STEP_4_PENDING,      // Contrat + pièces finales validés par le partenaire
    UNDER_REVIEW,        // Dossier complet en attente de revue backoffice
    VERIFIED,            // Complètement enregistré et vérifié
    REJECTED             // Rejeté par un admin
}
