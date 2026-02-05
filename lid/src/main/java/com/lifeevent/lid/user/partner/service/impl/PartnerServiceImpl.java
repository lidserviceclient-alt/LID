package com.lifeevent.lid.user.partner.service.impl;

import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.article.repository.CategoryRepository;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.user.common.service.UserService;
import com.lifeevent.lid.user.partner.dto.*;
import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;
import com.lifeevent.lid.user.partner.entity.Shop;
import com.lifeevent.lid.user.partner.mapper.PartnerMapper;
import com.lifeevent.lid.user.partner.mapper.ShopMapper;
import com.lifeevent.lid.user.partner.repository.PartnerRepository;
import com.lifeevent.lid.user.partner.repository.ShopRepository;
import com.lifeevent.lid.user.partner.service.PartnerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service Partner - Implémentation
 * Réutilise UserService pour les opérations génériques sur les utilisateurs
 * Implémente uniquement la logique spécifique au Partner (enregistrement en 3 étapes)
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PartnerServiceImpl implements PartnerService {
    
    private final PartnerRepository partnerRepository;
    private final ShopRepository shopRepository;
    private final PartnerMapper partnerMapper;
    private final ShopMapper shopMapper;
    private final UserService userService;
    private final CategoryRepository categoryRepository;
    
    @Override
    public PartnerResponseDto registerStep1(PartnerRegisterStep1RequestDto dto) {
        log.info("ÉTAPE 1 - Création Partner avec email: {}", dto.getEmail());
        
        // Vérifier que l'email n'existe pas (via UserService qui vérifie TOUS les users)
        if (userService.emailExists(dto.getEmail())) {
            throw new IllegalArgumentException("L'email existe déjà dans le système");
        }
        
        // Créer le Partner à partir du DTO (statut par défaut = STEP_1_PENDING)
        Partner partner = partnerMapper.toEntityFromStep1(dto);
        partner.setRegistrationStatus(PartnerRegistrationStatus.STEP_1_PENDING);
        
        // Sauvegarder le Partner
        Partner saved = partnerRepository.save(partner);
        log.info("Partner créé avec succès: {}", saved.getUserId());
        
        return partnerMapper.toResponseDto(saved);
    }
    
    @Override
    public PartnerResponseDto registerStep2(PartnerRegisterStep2RequestDto dto) {
        log.info("ÉTAPE 2 - Ajout boutique pour Partner: {}", dto.getPartnerId());
        
        // Récupérer le Partner existant
        Partner partner = partnerRepository.findById(dto.getPartnerId())
            .orElseThrow(() -> new ResourceNotFoundException("Partner non trouvé", "partnerId", dto.getPartnerId()));
        
        // Récupérer la Category
        Category mainCategory = categoryRepository.findById(dto.getMainCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category non trouvée", "categoryId", dto.getMainCategoryId().toString()));
        
        // Créer la Shop
        Shop shop = Shop.builder()
            .shopName(dto.getShopName())
            .mainCategory(mainCategory)
            .shopDescription(dto.getShopDescription())
            .partner(partner)
            .build();
        
        Shop savedShop = shopRepository.save(shop);
        partner.setShop(savedShop);
        partner.setRegistrationStatus(PartnerRegistrationStatus.STEP_2_PENDING);
        
        Partner updated = partnerRepository.save(partner);
        log.info("Boutique créée pour Partner: {}", partner.getUserId());
        
        return partnerMapper.toResponseDto(updated);
    }
    
    @Override
    public PartnerResponseDto registerStep3(PartnerRegisterStep3RequestDto dto) {
        log.info("ÉTAPE 3 - Ajout infos légales pour Partner: {}", dto.getPartnerId());
        
        // Récupérer le Partner avec sa Shop
        Partner partner = partnerRepository.findByUserIdWithShop(dto.getPartnerId())
            .orElseThrow(() -> new ResourceNotFoundException("Partner non trouvé", "partnerId", dto.getPartnerId()));
        
        // Mettre à jour les infos légales
        partnerMapper.updateEntityFromStep3(dto, partner);
        partner.setRegistrationStatus(PartnerRegistrationStatus.STEP_3_PENDING);

        Partner updated = partnerRepository.save(partner);
        log.info("Infos légales ajoutées pour Partner: {}", partner.getUserId());

        return partnerMapper.toResponseDto(updated);
    }

    // Rôle PARTNER accordé uniquement après VERIFIED (pas à STEP_3_PENDING)
    
    @Override
    @Transactional(readOnly = true)
    public Optional<PartnerResponseDto> getPartnerById(String partnerId) {
        return partnerRepository.findByUserIdWithShop(partnerId)
            .map(partnerMapper::toResponseDto);
    }
    
    @Override
    public PartnerResponseDto updatePartner(String partnerId, PartnerResponseDto dto) {
        log.info("Mise à jour Partner: {}", partnerId);
        
        Partner partner = partnerRepository.findById(partnerId)
            .orElseThrow(() -> new ResourceNotFoundException("Partner non trouvé", "partnerId", partnerId));
        
        // Mettre à jour les champs sûrs
        if (dto.getFirstName() != null) {
            partner.setFirstName(dto.getFirstName());
        }
        if (dto.getLastName() != null) {
            partner.setLastName(dto.getLastName());
        }
        if (dto.getPhoneNumber() != null) {
            partner.setPhoneNumber(dto.getPhoneNumber());
        }
        
        Partner updated = partnerRepository.save(partner);
        return partnerMapper.toResponseDto(updated);
    }
    
    @Override
    public void deletePartner(String partnerId) {
        log.info("Suppression Partner: {}", partnerId);
        
        Partner partner = partnerRepository.findById(partnerId)
            .orElseThrow(() -> new ResourceNotFoundException("Partner non trouvé", "partnerId", partnerId));
        
        // Si le Partner a une Shop, la supprimer en cascade (via CascadeType.ALL)
        partnerRepository.delete(partner);
        log.info("Partner supprimé: {}", partnerId);
    }
}
