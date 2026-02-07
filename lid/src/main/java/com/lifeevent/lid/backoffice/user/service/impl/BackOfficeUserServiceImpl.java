package com.lifeevent.lid.backoffice.user.service.impl;

import com.lifeevent.lid.auth.constant.UserRole;
import com.lifeevent.lid.auth.entity.Authentication;
import com.lifeevent.lid.auth.repository.AuthenticationRepository;
import com.lifeevent.lid.backoffice.user.dto.BackOfficeUserDto;
import com.lifeevent.lid.backoffice.user.mapper.BackOfficeUserMapper;
import com.lifeevent.lid.backoffice.user.service.BackOfficeUserService;
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

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeUserDto> getAll(Pageable pageable, String role, String q) {
        List<UserEntity> users = userEntityRepository.findAll();
        if (users.isEmpty()) {
            return Page.empty(pageable);
        }

        Map<String, Authentication> authMap = loadAuthMap(users);
        String roleFilter = role == null ? "" : role.trim().toUpperCase();
        String query = q == null ? "" : q.trim().toLowerCase();

        List<BackOfficeUserDto> filtered = new ArrayList<>();
        for (UserEntity user : users) {
            Authentication auth = authMap.get(user.getUserId());
            BackOfficeUserDto dto = backOfficeUserMapper.toDto(user, auth);
            if (!roleFilter.isEmpty() && (dto.getRole() == null || !dto.getRole().equalsIgnoreCase(roleFilter))) {
                continue;
            }
            if (!query.isEmpty() && !matchesQuery(user, dto, query)) {
                continue;
            }
            filtered.add(dto);
        }

        int total = filtered.size();
        int start = Math.toIntExact(pageable.getOffset());
        if (start >= total) {
            return new PageImpl<>(List.of(), pageable, total);
        }
        int end = Math.min(start + pageable.getPageSize(), total);
        List<BackOfficeUserDto> pageContent = filtered.subList(start, end);
        return new PageImpl<>(pageContent, pageable, total);
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
    public BackOfficeUserDto update(String id, BackOfficeUserDto dto) {
        UserEntity entity = userEntityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        backOfficeUserMapper.updateEntityFromDto(dto, entity);
        UserEntity saved = saveEntity(entity);
        Authentication auth = upsertAuth(id, dto != null ? dto.getRole() : null);
        return backOfficeUserMapper.toDto(saved, auth);
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

    private boolean matchesQuery(UserEntity user, BackOfficeUserDto dto, String query) {
        String id = user.getUserId() == null ? "" : user.getUserId().toLowerCase();
        String email = user.getEmail() == null ? "" : user.getEmail().toLowerCase();
        String first = user.getFirstName() == null ? "" : user.getFirstName().toLowerCase();
        String last = user.getLastName() == null ? "" : user.getLastName().toLowerCase();
        String name = ((dto.getPrenom() == null ? "" : dto.getPrenom()) + " " + (dto.getNom() == null ? "" : dto.getNom())).toLowerCase();

        return id.contains(query)
                || email.contains(query)
                || first.contains(query)
                || last.contains(query)
                || name.contains(query);
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
                    .build();
        }
        return UserEntity.builder()
                .userId(userId)
                .firstName(dto.getPrenom())
                .lastName(dto.getNom())
                .email(dto.getEmail())
                .emailVerified(Boolean.TRUE.equals(dto.getEmailVerifie()))
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

    private Authentication upsertAuth(String userId, String role) {
        if (userId == null || userId.isBlank() || role == null || role.isBlank()) {
            return authenticationRepository.findById(userId).orElse(null);
        }
        Authentication auth = authenticationRepository.findById(userId)
                .orElseGet(() -> Authentication.builder().userId(userId).build());
        auth.setRoles(mapRole(role));
        return authenticationRepository.save(auth);
    }

    private List<UserRole> mapRole(String role) {
        String normalized = role == null ? "" : role.trim().toUpperCase();
        if ("PARTENAIRE".equals(normalized)) return List.of(UserRole.PARTNER);
        if ("CLIENT".equals(normalized)) return List.of(UserRole.CUSTOMER);
        if (normalized.isBlank()) return List.of();
        return List.of(UserRole.ADMIN);
    }
}
