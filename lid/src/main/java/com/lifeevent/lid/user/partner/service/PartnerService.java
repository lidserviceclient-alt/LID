package com.lifeevent.lid.user.partner.service;

import com.lifeevent.lid.user.partner.dto.*;

import java.util.Optional;

/**
 * Service Partner - Gère l'enregistrement partenaire et les opérations CRUD spécifiques
 */
public interface PartnerService {
    
    /**
     * ÉTAPE 1 : Créer un Partner avec infos de compte de base
     * Crée un Partner avec le statut STEP_1_PENDING
     */
    PartnerRegisterStep1ResponseDto registerStep1(PartnerRegisterStep1RequestDto dto);
    
    /**
     * ÉTAPE 2 : Ajouter les infos de boutique
     * Crée la Shop et passe le Partner au statut STEP_2_PENDING
     */
    PartnerResponseDto registerStep2(PartnerRegisterStep2RequestDto dto);

    /**
     * UPGRADE : Transformer un Customer existant en Partner
     */
    PartnerResponseDto upgradeCustomerToPartner(String userId, PartnerRegisterStep1RequestDto dto);
    
    /**
     * ÉTAPE 3 : Ajouter les infos légales
     * Met à jour les champs légaux et passe au statut STEP_3_PENDING
     */
    PartnerResponseDto registerStep3(PartnerRegisterStep3RequestDto dto);

    /**
     * ÉTAPE 4 : Contrat + pièces finales
     */
    PartnerResponseDto registerStep4(PartnerRegisterStep4RequestDto dto);

    /**
     * Agrégat onboarding partner (step 1..4 + statut)
     */
    PartnerRegistrationAggregateDto getRegistrationAggregate();

    /**
     * Récupérer un Partner par ID
     */
    Optional<PartnerResponseDto> getPartnerById(String partnerId);
    
    /**
     * Mettre à jour les infos d'un Partner (CRUD)
     * Peut être utilisé pour mettre à jour les champs génériques (firstName, lastName, etc)
     */
    PartnerResponseDto updatePartner(String partnerId, PartnerResponseDto dto);
    
    /**
     * Supprimer un Partner (hard delete)
     */
    void deletePartner(String partnerId);
}
