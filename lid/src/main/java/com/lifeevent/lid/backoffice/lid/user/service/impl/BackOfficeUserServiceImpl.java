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
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.user.common.entity.UserEntity;
import com.lifeevent.lid.user.common.repository.UserEntityRepository;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
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

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeUserDto> getAll(Pageable pageable, String role, String q) {
        String roleFilter = role == null ? "" : role.trim().toUpperCase();
        String query = q == null ? "" : q.trim().toLowerCase();
        Class<? extends UserEntity> roleClass = resolveRoleClass(roleFilter);

        if (isAuthRole(roleFilter)) {
            return getAllByAuthRole(pageable, roleFilter, query);
        }

        Page<UserEntity> usersPage = userEntityRepository.search(roleClass, query, pageable);
        if (usersPage.isEmpty()) {
            return Page.empty(pageable);
        }

        Map<String, Authentication> authMap = loadAuthMap(usersPage.getContent());
        List<BackOfficeUserDto> content = new ArrayList<>();
        for (UserEntity user : usersPage.getContent()) {
            Authentication auth = authMap.get(user.getUserId());
            BackOfficeUserDto dto = backOfficeUserMapper.toDto(user, auth);
            content.add(dto);
        }
        return new PageImpl<>(content, pageable, usersPage.getTotalElements());
    }

    private Page<BackOfficeUserDto> getAllByAuthRole(Pageable pageable, String roleFilter, String query) {
        List<String> roles = mapAuthRoles(roleFilter);
        Page<String> idsPage = authenticationRepository.searchUserIdsByRolesIn(roles, query, pageable);
        if (idsPage.isEmpty()) {
            return Page.empty(pageable);
        }

        List<String> ids = idsPage.getContent();
        Map<String, UserEntity> usersById = userEntityRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(UserEntity::getUserId, u -> u));
        Map<String, Authentication> authById = authenticationRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Authentication::getUserId, a -> a));

        List<BackOfficeUserDto> content = ids.stream()
                .map(id -> {
                    UserEntity user = usersById.get(id);
                    if (user == null) {
                        return null;
                    }
                    return backOfficeUserMapper.toDto(user, authById.get(id));
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
        return backOfficeUserMapper.toDto(user, auth);
    }

    @Override
    public BackOfficeUserDto create(BackOfficeUserDto dto) {
        if (dto == null) {
            dto = new BackOfficeUserDto();
        }
        String userId = (dto != null && dto.getId() != null && !dto.getId().isBlank())
                ? dto.getId()
                : UUID.randomUUID().toString();
        UserEntity entity = buildEntityFromDto(dto, userId);
        UserEntity saved = saveEntity(entity);
        Authentication auth = upsertAuth(
                userId,
                dto != null ? dto.getRole() : null,
                dto != null ? dto.getPassword() : null
        );
        return backOfficeUserMapper.toDto(saved, auth);
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
        Authentication auth = upsertAuth(
                id,
                dto != null ? dto.getRole() : null,
                dto != null ? dto.getPassword() : null
        );
        return backOfficeUserMapper.toDto(saved, auth);
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
        authenticationRepository.findById(id).ifPresent(authenticationRepository::delete);
        userEntityRepository.deleteById(id);
    }

    private Map<String, Authentication> loadAuthMap(List<UserEntity> users) {
        List<String> ids = users.stream()
                .map(UserEntity::getUserId)
                .filter(Objects::nonNull)
                .toList();
        if (ids.isEmpty()) return Map.of();
        return authenticationRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Authentication::getUserId, a -> a));
    }

    private Class<? extends UserEntity> resolveRoleClass(String role) {
        if (role == null || role.isBlank()) {
            return null;
        }
        return switch (role) {
            case "CLIENT" -> Customer.class;
            case "PARTENAIRE" -> Partner.class;
            default -> null;
        };
    }

    private boolean isAuthRole(String role) {
        return "ADMIN".equals(role) || "SUPER_ADMIN".equals(role) || "LIVREUR".equals(role);
    }

    private List<String> mapAuthRoles(String role) {
        return switch (role) {
            case "ADMIN" -> List.of("ADMIN");
            case "SUPER_ADMIN" -> List.of("SUPER_ADMIN");
            case "LIVREUR" -> List.of("LIVREUR");
            default -> List.of();
        };
    }

    private UserEntity buildEntityFromDto(BackOfficeUserDto dto, String userId) {
        String role = dto.getRole() == null ? "" : dto.getRole().trim().toUpperCase();
        if ("PARTENAIRE".equals(role)) {
            return Partner.builder()
                    .userId(userId)
                    .firstName(dto.getPrenom())
                    .lastName(dto.getNom())
                    .email(dto.getEmail())
                    .emailVerified(Boolean.TRUE.equals(dto.getEmailVerifie()))
                    .phoneNumber(dto.getTelephone())
                    .city(dto.getVille())
                    .country(dto.getPays())
                    .blocked(Boolean.TRUE.equals(dto.getBlocked()))
                    .build();
        }
        if ("CLIENT".equals(role)) {
            return Customer.builder()
                    .userId(userId)
                    .firstName(dto.getPrenom())
                    .lastName(dto.getNom())
                    .email(dto.getEmail())
                    .emailVerified(Boolean.TRUE.equals(dto.getEmailVerifie()))
                    .phoneNumber(dto.getTelephone())
                    .city(dto.getVille())
                    .country(dto.getPays())
                    .avatarUrl(dto.getAvatarUrl())
                    .blocked(Boolean.TRUE.equals(dto.getBlocked()))
                    .build();
        }
        return UserEntity.builder()
                .userId(userId)
                .firstName(dto.getPrenom())
                .lastName(dto.getNom())
                .email(dto.getEmail())
                .emailVerified(Boolean.TRUE.equals(dto.getEmailVerifie()))
                .blocked(Boolean.TRUE.equals(dto.getBlocked()))
                .build();
    }

    private UserEntity saveEntity(UserEntity entity) {
        if (entity instanceof Customer customer) {
            return customerRepository.save(customer);
        }
        if (entity instanceof Partner partner) {
            return partnerRepository.save(partner);
        }
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
        // Hibernate may clear/replace this collection during merge, so it must stay mutable.
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
        if ("PARTENAIRE".equals(normalized)) return new ArrayList<>(List.of(UserRole.PARTNER));
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

    private BackOfficeUserDto updateBlockedState(String id, boolean blocked) {
        UserEntity entity = userEntityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        entity.setBlocked(blocked);
        UserEntity saved = saveEntity(entity);
        Authentication auth = authenticationRepository.findById(id).orElse(null);
        return backOfficeUserMapper.toDto(saved, auth);
    }
}
