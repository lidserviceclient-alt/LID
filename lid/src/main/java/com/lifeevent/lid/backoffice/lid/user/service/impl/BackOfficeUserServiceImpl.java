package com.lifeevent.lid.backoffice.lid.user.service.impl;

import com.lifeevent.lid.auth.constant.AuthenticationType;
import com.lifeevent.lid.auth.constant.UserRole;
import com.lifeevent.lid.auth.entity.Authentication;
import com.lifeevent.lid.auth.repository.AuthenticationRepository;
import com.lifeevent.lid.auth.service.AuthService;
import com.lifeevent.lid.backoffice.lid.user.dto.BackOfficeUserDto;
import com.lifeevent.lid.backoffice.lid.user.dto.CreateBackOfficeCourierRequest;
import com.lifeevent.lid.backoffice.lid.user.mapper.BackOfficeUserMapper;
import com.lifeevent.lid.backoffice.lid.user.service.BackOfficeUserService;
import com.lifeevent.lid.cart.repository.CartArticleRepository;
import com.lifeevent.lid.cart.repository.CartRepository;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.loyalty.repository.LoyaltyPointAdjustmentRepository;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.review.repository.ProductReviewRepository;
import com.lifeevent.lid.user.common.entity.UserEntity;
import com.lifeevent.lid.user.common.repository.UserEntityRepository;
import com.lifeevent.lid.user.common.service.UserService;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.repository.CustomerAddressRepository;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import com.lifeevent.lid.user.deliverydriver.entity.DelivryDriverProfileEntity;
import com.lifeevent.lid.user.deliverydriver.repository.DelivryDriverProfileRepository;
import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.repository.PartnerRepository;
import com.lifeevent.lid.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BackOfficeUserServiceImpl implements BackOfficeUserService {

    private final UserEntityRepository userEntityRepository;
    private final CustomerRepository customerRepository;
    private final PartnerRepository partnerRepository;
    private final AuthenticationRepository authenticationRepository;
    private final BackOfficeUserMapper backOfficeUserMapper;
    private final AuthService authService;
    private final UserService userService;
    private final DelivryDriverProfileRepository livreurProfileRepository;
    private final CartArticleRepository cartArticleRepository;
    private final CartRepository cartRepository;
    private final WishlistRepository wishlistRepository;
    private final CustomerAddressRepository customerAddressRepository;
    private final OrderRepository orderRepository;
    private final ProductReviewRepository productReviewRepository;
    private final LoyaltyPointAdjustmentRepository loyaltyPointAdjustmentRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeUserDto> getAll(Pageable pageable, String role, String q) {
        String roleFilter = role == null ? "" : role.trim().toUpperCase();
        String query = q == null ? "" : q.trim().toLowerCase();
        if (!roleFilter.isBlank()) {
            return getAllByAuthRole(pageable, roleFilter, query);
        }

        Page<UserEntity> usersPage = userEntityRepository.search(query, pageable);
        if (usersPage.isEmpty()) {
            return Page.empty(pageable);
        }

        Map<String, Authentication> authMap = loadAuthMap(usersPage.getContent());
        Map<String, Customer> customerProfiles = loadCustomerProfilesForIds(usersPage.getContent().stream()
                .map(UserEntity::getUserId)
                .filter(Objects::nonNull)
                .toList(), authMap);
        Map<String, Partner> partnerProfiles = loadPartnerProfilesForIds(usersPage.getContent().stream()
                .map(UserEntity::getUserId)
                .filter(Objects::nonNull)
                .toList(), authMap);
        Map<String, DelivryDriverProfileEntity> livreurProfiles = loadDelivryDriverProfilesForUsers(usersPage.getContent(), authMap);
        List<BackOfficeUserDto> content = new ArrayList<>();
        for (UserEntity user : usersPage.getContent()) {
            String userId = user.getUserId();
            Authentication auth = authMap.get(userId);
            DelivryDriverProfileEntity livreurProfile = livreurProfiles.get(userId);
            content.add(backOfficeUserMapper.toDto(user, auth, customerProfiles.get(userId), partnerProfiles.get(userId), livreurProfile));
        }
        return new PageImpl<>(content, pageable, usersPage.getTotalElements());
    }

    private Page<BackOfficeUserDto> getAllByAuthRole(Pageable pageable, String roleFilter, String query) {
        List<String> roles = mapAuthRoles(roleFilter);
        if (roles.isEmpty()) {
            return Page.empty(pageable);
        }
        Page<String> idsPage = authenticationRepository.searchUserIdsByRolesIn(roles, query, pageable);
        if (idsPage.isEmpty()) {
            return Page.empty(pageable);
        }

        List<String> ids = idsPage.getContent();
        Map<String, UserEntity> usersById = userEntityRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(UserEntity::getUserId, u -> u));
        Map<String, Authentication> authById = authenticationRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Authentication::getUserId, a -> a));
        Map<String, Customer> customerProfiles = loadCustomerProfilesForIds(ids, authById);
        Map<String, Partner> partnerProfiles = loadPartnerProfilesForIds(ids, authById);
        Map<String, DelivryDriverProfileEntity> livreurProfiles = loadDelivryDriverProfilesForIds(ids, authById);

        List<BackOfficeUserDto> content = ids.stream()
                .map(id -> {
                    UserEntity user = usersById.get(id);
                    if (user == null) {
                        return null;
                    }
                    return backOfficeUserMapper.toDto(
                            user,
                            authById.get(id),
                            customerProfiles.get(id),
                            partnerProfiles.get(id),
                            livreurProfiles.get(id)
                    );
                })
                .filter(Objects::nonNull)
                .toList();

        return new PageImpl<>(content, pageable, idsPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeUserDto getById(String id) {
        UserEntity user = userEntityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        Authentication auth = authenticationRepository.findById(id).orElse(null);
        DelivryDriverProfileEntity livreurProfile = hasRole(auth, UserRole.LIVREUR)
                ? userService.getDeliveryProfile(id).orElse(null)
                : null;
        Customer customer = hasRole(auth, UserRole.CUSTOMER) ? userService.getCustomerProfile(id).orElse(null) : null;
        Partner partner = hasRole(auth, UserRole.PARTNER) ? userService.getPartnerProfile(id).orElse(null) : null;
        return backOfficeUserMapper.toDto(user, auth, customer, partner, livreurProfile);
    }

    @Override
    public BackOfficeUserDto create(BackOfficeUserDto dto) {
        if (dto == null) {
            dto = new BackOfficeUserDto();
        }
        String userId = (dto.getId() != null && !dto.getId().isBlank())
                ? dto.getId()
                : UUID.randomUUID().toString();
        UserEntity entity = buildEntityFromDto(dto, userId);
        UserEntity saved = saveEntity(entity);
        Authentication auth = upsertAuth(userId, dto.getRole(), dto.getPassword());
        synchronizeRoleProfiles(userId, dto, auth);
        DelivryDriverProfileEntity livreurProfile = hasRole(auth, UserRole.LIVREUR) ? userService.getDeliveryProfile(userId).orElse(null) : null;
        Customer customer = hasRole(auth, UserRole.CUSTOMER) ? userService.getCustomerProfile(userId).orElse(null) : null;
        Partner partner = hasRole(auth, UserRole.PARTNER) ? userService.getPartnerProfile(userId).orElse(null) : null;
        return backOfficeUserMapper.toDto(saved, auth, customer, partner, livreurProfile);
    }

    @Override
    public BackOfficeUserDto createCourier(CreateBackOfficeCourierRequest request) {
        BackOfficeUserDto dto = toCourierDto(request);
        return create(dto);
    }

    @Override
    public BackOfficeUserDto update(String id, BackOfficeUserDto dto) {
        UserEntity entity = userEntityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        backOfficeUserMapper.updateEntityFromDto(dto, entity);
        UserEntity saved = saveEntity(entity);
        Authentication auth = upsertAuth(id, dto != null ? dto.getRole() : null, dto != null ? dto.getPassword() : null);
        synchronizeRoleProfiles(id, dto, auth);
        DelivryDriverProfileEntity livreurProfile = hasRole(auth, UserRole.LIVREUR) ? userService.getDeliveryProfile(id).orElse(null) : null;
        Customer customer = hasRole(auth, UserRole.CUSTOMER) ? userService.getCustomerProfile(id).orElse(null) : null;
        Partner partner = hasRole(auth, UserRole.PARTNER) ? userService.getPartnerProfile(id).orElse(null) : null;
        return backOfficeUserMapper.toDto(saved, auth, customer, partner, livreurProfile);
    }

    @Override
    public BackOfficeUserDto block(String id) {
        return updateBlockedState(id, true);
    }

    @Override
    public BackOfficeUserDto unblock(String id) {
        return updateBlockedState(id, false);
    }

    @Override
    public void delete(String id) {
        if (!userEntityRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        // Shared-PK profiles must be deleted before the base user row.
        livreurProfileRepository.findById(id).ifPresent(livreurProfileRepository::delete);
        partnerRepository.findById(id).ifPresent(partnerRepository::delete);
        if (customerRepository.existsById(id)) {
            deleteCustomerProfileIfAllowed(id);
        }
        authenticationRepository.findById(id).ifPresent(authenticationRepository::delete);
        userEntityRepository.deleteById(id);
    }

    private void deleteCustomerProfileIfAllowed(String userId) {
        long orderCount = orderRepository.countByCustomer_UserId(userId);
        long reviewCount = productReviewRepository.countByCustomer_UserId(userId);
        long loyaltyAdjustmentCount = loyaltyPointAdjustmentRepository.countByCustomer_UserId(userId);
        if (orderCount > 0 || reviewCount > 0 || loyaltyAdjustmentCount > 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Impossible de supprimer ce client: il possède un historique métier. Bloquez le compte ou anonymisez-le."
            );
        }

        wishlistRepository.deleteByCustomer_UserId(userId);
        customerAddressRepository.deleteByCustomer_UserId(userId);
        cartArticleRepository.deleteByCart_Customer_UserId(userId);
        cartRepository.deleteByCustomer_UserId(userId);
        customerRepository.deleteById(userId);
    }

    private void synchronizeRoleProfiles(String userId, BackOfficeUserDto dto, Authentication auth) {
        if (hasRole(auth, UserRole.CUSTOMER)) {
            userService.getOrCreateCustomerAccount(
                    userId,
                    dto != null ? dto.getEmail() : null,
                    dto != null && Boolean.TRUE.equals(dto.getEmailVerifie()),
                    dto != null ? dto.getPrenom() : null,
                    dto != null ? dto.getNom() : null,
                    dto != null ? dto.getBlocked() : null
            );
        }
        if (hasRole(auth, UserRole.PARTNER)) {
            Partner partner = userService.getPartnerProfile(userId).orElseGet(() -> {
                UserEntity user = userEntityRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                Partner created = new Partner();
                created.setUser(user);
                return created;
            });
            if (dto != null) {
                if (dto.getTelephone() != null) partner.setPhoneNumber(dto.getTelephone());
                if (dto.getVille() != null) partner.setCity(dto.getVille());
                if (dto.getPays() != null) partner.setCountry(dto.getPays());
            }
            Partner savedPartner = partnerRepository.save(partner);
            userService.upsertPartnerProfile(savedPartner);
        }
        if (hasRole(auth, UserRole.LIVREUR)) {
            userService.upsertDelivryDriverProfile(
                    userId,
                    dto != null ? dto.getTelephone() : null,
                    dto != null ? dto.getVille() : null,
                    dto != null ? dto.getPays() : null
            );
        }
    }

    private Map<String, Authentication> loadAuthMap(List<UserEntity> users) {
        List<String> ids = users.stream()
                .map(UserEntity::getUserId)
                .filter(Objects::nonNull)
                .toList();
        if (ids.isEmpty()) {
            return Map.of();
        }
        return authenticationRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Authentication::getUserId, a -> a));
    }

    private Map<String, DelivryDriverProfileEntity> loadDelivryDriverProfilesForUsers(List<UserEntity> users,
                                                                          Map<String, Authentication> authByUserId) {
        List<String> ids = users.stream()
                .map(UserEntity::getUserId)
                .filter(Objects::nonNull)
                .toList();
        return loadDelivryDriverProfilesForIds(ids, authByUserId);
    }

    private Map<String, DelivryDriverProfileEntity> loadDelivryDriverProfilesForIds(List<String> ids,
                                                                        Map<String, Authentication> authByUserId) {
        if (ids == null || ids.isEmpty()) {
            return Map.of();
        }
        List<String> livreurIds = ids.stream()
                .filter(id -> hasRole(authByUserId.get(id), UserRole.LIVREUR))
                .toList();
        if (livreurIds.isEmpty()) {
            return Map.of();
        }
        return userService.getDeliveryProfilesByIds(livreurIds);
    }

    private Map<String, Customer> loadCustomerProfilesForIds(List<String> ids, Map<String, Authentication> authByUserId) {
        if (ids == null || ids.isEmpty()) {
            return Map.of();
        }
        List<String> customerIds = ids.stream()
                .filter(id -> hasRole(authByUserId.get(id), UserRole.CUSTOMER))
                .toList();
        if (customerIds.isEmpty()) {
            return Map.of();
        }
        return userService.getCustomerProfilesByIds(customerIds);
    }

    private Map<String, Partner> loadPartnerProfilesForIds(List<String> ids, Map<String, Authentication> authByUserId) {
        if (ids == null || ids.isEmpty()) {
            return Map.of();
        }
        List<String> partnerIds = ids.stream()
                .filter(id -> hasRole(authByUserId.get(id), UserRole.PARTNER))
                .toList();
        if (partnerIds.isEmpty()) {
            return Map.of();
        }
        return userService.getPartnerProfilesByIds(partnerIds);
    }

    private boolean hasRole(Authentication auth, UserRole role) {
        return auth != null
                && auth.getRoles() != null
                && auth.getRoles().contains(role);
    }

    private List<String> mapAuthRoles(String role) {
        return switch (role) {
            case "ADMIN" -> List.of("ADMIN");
            case "SUPER_ADMIN" -> List.of("SUPER_ADMIN");
            case "LIVREUR" -> List.of("LIVREUR");
            case "CLIENT" -> List.of("CUSTOMER");
            case "PARTENAIRE" -> List.of("PARTNER");
            default -> List.of();
        };
    }

    private UserEntity buildEntityFromDto(BackOfficeUserDto dto, String userId) {
        String role = dto == null ? null : dto.getRole();
        String email = dto == null ? null : dto.getEmail();
        return UserEntity.builder()
                .userId(userId)
                .firstName(dto.getPrenom())
                .lastName(dto.getNom())
                .email(resolveUserEmail(role, userId, email))
                .emailVerified(Boolean.TRUE.equals(dto.getEmailVerifie()))
                .blocked(Boolean.TRUE.equals(dto.getBlocked()))
                .build();
    }

    private UserEntity saveEntity(UserEntity entity) {
        return userEntityRepository.save(entity);
    }

    private Authentication upsertAuth(String userId, String role, String rawPassword) {
        if (userId == null || userId.isBlank() || role == null || role.isBlank()) {
            return authenticationRepository.findById(userId).orElse(null);
        }

        String normalizedRole = role.trim().toUpperCase();
        boolean requiresLocalPassword = "LIVREUR".equals(normalizedRole);

        Authentication auth = authenticationRepository.findById(userId)
                .orElseGet(() -> Authentication.builder().userId(userId).build());
        auth.setRoles(new ArrayList<>(mapRole(normalizedRole)));

        if (requiresLocalPassword) {
            String trimmedPassword = rawPassword == null ? "" : rawPassword.trim();
            if (!trimmedPassword.isBlank()) {
                String effectivePasswordHash = authService.hashLocalPassword(trimmedPassword);
                authService.upsertLocalAuthentication(
                        userId,
                        effectivePasswordHash,
                        AuthenticationType.LOCAL,
                        mapRole(normalizedRole)
                );
                return authenticationRepository.findById(userId).orElse(null);
            }
        }

        return authenticationRepository.save(auth);
    }

    private List<UserRole> mapRole(String role) {
        String normalized = role == null ? "" : role.trim().toUpperCase();
        if ("SUPER_ADMIN".equals(normalized)) return new ArrayList<>(List.of(UserRole.SUPER_ADMIN));
        if ("PARTENAIRE".equals(normalized)) return new ArrayList<>(List.of(UserRole.PARTNER, UserRole.CUSTOMER));
        if ("LIVREUR".equals(normalized)) return new ArrayList<>(List.of(UserRole.LIVREUR));
        if ("CLIENT".equals(normalized)) return new ArrayList<>(List.of(UserRole.CUSTOMER));
        if (normalized.isBlank()) return new ArrayList<>();
        return new ArrayList<>(List.of(UserRole.ADMIN));
    }

    private BackOfficeUserDto toCourierDto(CreateBackOfficeCourierRequest request) {
        return BackOfficeUserDto.builder()
                .prenom(request != null ? request.getPrenom() : null)
                .nom(request != null ? request.getNom() : null)
                .email(request != null ? request.getEmail() : null)
                .password(request != null ? request.getPassword() : null)
                .telephone(request != null ? request.getTelephone() : null)
                .emailVerifie(Boolean.TRUE)
                .blocked(Boolean.FALSE)
                .role("LIVREUR")
                .build();
    }

    private String resolveUserEmail(String role, String userId, String email) {
        String normalizedEmail = email == null ? null : email.trim().toLowerCase();
        if (normalizedEmail != null && !normalizedEmail.isBlank()) {
            return normalizedEmail;
        }
        String normalizedRole = role == null ? "" : role.trim().toUpperCase();
        if ("LIVREUR".equals(normalizedRole)) {
            return "livreur+" + userId + "@delivery.lid.local";
        }
        return normalizedEmail;
    }

    private BackOfficeUserDto updateBlockedState(String id, boolean blocked) {
        UserEntity entity = userEntityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        entity.setBlocked(blocked);
        UserEntity saved = saveEntity(entity);
        Authentication auth = authenticationRepository.findById(id).orElse(null);
        DelivryDriverProfileEntity livreurProfile = hasRole(auth, UserRole.LIVREUR) ? userService.getDeliveryProfile(id).orElse(null) : null;
        Customer customer = hasRole(auth, UserRole.CUSTOMER) ? userService.getCustomerProfile(id).orElse(null) : null;
        Partner partner = hasRole(auth, UserRole.PARTNER) ? userService.getPartnerProfile(id).orElse(null) : null;
        return backOfficeUserMapper.toDto(saved, auth, customer, partner, livreurProfile);
    }
}
