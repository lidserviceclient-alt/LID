package com.lifeevent.lid.user.common.service.impl;

import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.util.PhoneNumberUtils;
import com.lifeevent.lid.user.common.dto.UserDto;
import com.lifeevent.lid.user.common.entity.UserEntity;
import com.lifeevent.lid.user.common.mapper.UserMapper;
import com.lifeevent.lid.user.common.repository.UserEntityRepository;
import com.lifeevent.lid.user.common.service.UserService;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import com.lifeevent.lid.user.deliverydriver.entity.DelivryDriverProfileEntity;
import com.lifeevent.lid.user.deliverydriver.repository.DelivryDriverProfileRepository;
import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service générique pour les UserEntity
 * 
 * Stratégie :
 * - Utilise des requêtes SANS jointures aux sous-classes (Customer, Admin, etc)
 * - Charge UNIQUEMENT les colonnes de UserEntity, pas celles des enfants
 * - Les services enfants (CustomerService, etc) gèrent leurs données spécifiques
 * - Performance optimisée pour les requêtes fréquentes sur la table parent
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    
    private final UserEntityRepository userEntityRepository;
    private final DelivryDriverProfileRepository livreurProfileRepository;
    private final CustomerRepository customerRepository;
    private final PartnerRepository partnerRepository;
    private final UserMapper userMapper;

    /**
     * Récupérer un utilisateur par ID
     * Requête directe sur UserEntity, pas de jointure à Customer/Admin/etc
     */
    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(String id) {
        log.debug("Récupération de l'utilisateur: {}", id);
        return userEntityRepository.findById(id)
            .map(userMapper::toDto)
            .orElseThrow(() -> new ResourceNotFoundException("User", "userId", id));
    }
    
    /**
     * Récupérer tous les utilisateurs
     * Charge TOUS les UserEntity (parents + enfants via discriminator)
     * MAIS SANS jointure à chaque sous-classe
     */
    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsers(Pageable pageable) {
        log.debug("Récupération de tous les utilisateurs");
        return userEntityRepository.findAll(pageable).map(userMapper::toDto);
    }
    
    /**
     * Recherche par email sur TOUS les utilisateurs
     * Requête optimisée sans jointure
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<UserDto> getUserByEmail(String email) {
        log.debug("Recherche utilisateur par email: {}", email);
        return userEntityRepository.findByEmail(email)
            .map(userMapper::toDto);
    }
    
    /**
     * Vérifier si un email existe
     * Requête très légère - COUNT sans join
     */
    @Override
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userEntityRepository.existsByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Customer> getCustomerProfile(String userId) {
        if (userId == null || userId.isBlank()) {
            return Optional.empty();
        }
        return customerRepository.findById(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Partner> getPartnerProfile(String userId) {
        if (userId == null || userId.isBlank()) {
            return Optional.empty();
        }
        return partnerRepository.findById(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DelivryDriverProfileEntity> getDeliveryProfile(String userId) {
        if (userId == null || userId.isBlank()) {
            return Optional.empty();
        }
        return livreurProfileRepository.findById(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Customer> getCustomerProfilesByIds(Collection<String> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }
        return customerRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(Customer::getUserId, c -> c));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Partner> getPartnerProfilesByIds(Collection<String> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }
        return partnerRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(Partner::getUserId, p -> p));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, DelivryDriverProfileEntity> getDeliveryProfilesByIds(Collection<String> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Map.of();
        }
        return livreurProfileRepository.findByUserIdIn(userIds).stream()
                .collect(Collectors.toMap(DelivryDriverProfileEntity::getUserId, p -> p));
    }

    @Override
    public DelivryDriverProfileEntity getOrCreateDelivryDriverProfile(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId manquant");
        }
        DelivryDriverProfileEntity profile = livreurProfileRepository.findById(userId)
                .orElseGet(() -> createDelivryDriverProfile(userId));
        return ensureDelivryDriverUserAttached(profile, userId);
    }

    @Override
    public DelivryDriverProfileEntity upsertDelivryDriverProfile(String userId, String phoneNumber, String city, String country) {
        DelivryDriverProfileEntity profile = getOrCreateDelivryDriverProfile(userId);
        profile.setPhoneNumber(normalizePhone(phoneNumber));
        profile.setCity(normalize(city));
        profile.setCountry(normalize(country));
        return livreurProfileRepository.save(profile);
    }

    private DelivryDriverProfileEntity createDelivryDriverProfile(String userId) {
        UserEntity user = requireManagedUser(userId);
        DelivryDriverProfileEntity profile = new DelivryDriverProfileEntity();
        profile.setUser(user);
        return livreurProfileRepository.save(profile);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String normalizePhone(String value) {
        return PhoneNumberUtils.normalizeE164OrNull(value);
    }

    @Override
    public Customer getOrCreateCustomerProfile(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId manquant");
        }
        Customer profile = customerRepository.findById(userId)
                .orElseGet(() -> createCustomerProfile(userId));
        return ensureCustomerUserAttached(profile, userId);
    }

    @Override
    public Customer upsertCustomerProfile(Customer customer) {
        if (customer == null || customer.getUserId() == null || customer.getUserId().isBlank()) {
            throw new IllegalArgumentException("Customer invalide");
        }
        Customer profile = getOrCreateCustomerProfile(customer.getUserId());
        profile.setAvatarUrl(normalize(customer.getAvatarUrl()));
        profile.setPhoneNumber(normalizePhone(customer.getPhoneNumber()));
        profile.setCity(normalize(customer.getCity()));
        profile.setCountry(normalize(customer.getCountry()));
        return customerRepository.save(profile);
    }

    @Override
    public Customer getOrCreateCustomerAccount(String userId,
                                               String email,
                                               boolean emailVerified,
                                               String firstName,
                                               String lastName,
                                               Boolean blocked) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId manquant");
        }
        UserEntity user = userEntityRepository.findById(userId)
                .orElseGet(() -> userEntityRepository.save(UserEntity.builder()
                        .userId(userId)
                        .email(normalize(email))
                        .emailVerified(emailVerified)
                        .firstName(normalize(firstName))
                        .lastName(normalize(lastName))
                        .blocked(Boolean.TRUE.equals(blocked))
                        .build()));
        Customer customer = customerRepository.findById(userId)
                .orElseGet(() -> {
                    Customer created = new Customer();
                    created.setUser(user);
                    return customerRepository.save(created);
                });
        if (customer.getUser() == null) {
            customer.setUser(user);
            customer = customerRepository.save(customer);
        }
        upsertCustomerProfile(customer);
        return customer;
    }

    @Override
    public Partner getOrCreatePartnerProfile(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId manquant");
        }
        Partner profile = partnerRepository.findById(userId)
                .orElseGet(() -> createPartnerProfile(userId));
        return ensurePartnerUserAttached(profile, userId);
    }

    @Override
    public Partner upsertPartnerProfile(Partner partner) {
        if (partner == null || partner.getUserId() == null || partner.getUserId().isBlank()) {
            throw new IllegalArgumentException("Partner invalide");
        }
        Partner profile = getOrCreatePartnerProfile(partner.getUserId());
        profile.setPhoneNumber(normalizePhone(partner.getPhoneNumber()));
        profile.setShop(partner.getShop());
        profile.setHeadOfficeAddress(normalize(partner.getHeadOfficeAddress()));
        profile.setCity(normalize(partner.getCity()));
        profile.setCountry(normalize(partner.getCountry()));
        profile.setNinea(normalize(partner.getNinea()));
        profile.setRccm(normalize(partner.getRccm()));
        profile.setBusinessRegistrationDocumentUrl(normalize(partner.getBusinessRegistrationDocumentUrl()));
        profile.setBankName(normalize(partner.getBankName()));
        profile.setAccountHolder(normalize(partner.getAccountHolder()));
        profile.setRib(normalize(partner.getRib()));
        profile.setIban(normalize(partner.getIban()));
        profile.setSwift(normalize(partner.getSwift()));
        profile.setContractAccepted(Boolean.TRUE.equals(partner.getContractAccepted()));
        profile.setIdDocumentUrl(normalize(partner.getIdDocumentUrl()));
        profile.setNineaDocumentUrl(normalize(partner.getNineaDocumentUrl()));
        profile.setSupportingDocumentsZipUrl(normalize(partner.getSupportingDocumentsZipUrl()));
        profile.setRegistrationStatus(partner.getRegistrationStatus());
        return partnerRepository.save(profile);
    }

    private Customer createCustomerProfile(String userId) {
        UserEntity user = requireManagedUser(userId);
        Customer profile = new Customer();
        profile.setUser(user);
        return customerRepository.save(profile);
    }

    private Partner createPartnerProfile(String userId) {
        UserEntity user = requireManagedUser(userId);
        Partner profile = new Partner();
        profile.setUser(user);
        return partnerRepository.save(profile);
    }

    private DelivryDriverProfileEntity ensureDelivryDriverUserAttached(DelivryDriverProfileEntity profile, String userId) {
        if (profile.getUser() != null) {
            return profile;
        }
        UserEntity user = requireManagedUser(userId);
        profile.setUser(user);
        return livreurProfileRepository.save(profile);
    }

    private Customer ensureCustomerUserAttached(Customer profile, String userId) {
        if (profile.getUser() != null) {
            return profile;
        }
        UserEntity user = requireManagedUser(userId);
        profile.setUser(user);
        return customerRepository.save(profile);
    }

    private Partner ensurePartnerUserAttached(Partner profile, String userId) {
        if (profile.getUser() != null) {
            return profile;
        }
        UserEntity user = requireManagedUser(userId);
        profile.setUser(user);
        return partnerRepository.save(profile);
    }

    private UserEntity requireManagedUser(String userId) {
        return userEntityRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
    }
}
