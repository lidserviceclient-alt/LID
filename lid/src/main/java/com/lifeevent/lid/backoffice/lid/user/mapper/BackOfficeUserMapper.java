package com.lifeevent.lid.backoffice.lid.user.mapper;

import com.lifeevent.lid.auth.constant.UserRole;
import com.lifeevent.lid.auth.entity.Authentication;
import com.lifeevent.lid.backoffice.lid.user.dto.BackOfficeUserAuthDto;
import com.lifeevent.lid.backoffice.lid.user.dto.BackOfficeUserDto;
import com.lifeevent.lid.user.common.entity.UserEntity;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.deliverydriver.entity.DelivryDriverProfileEntity;
import com.lifeevent.lid.user.partner.entity.Partner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class BackOfficeUserMapper {

    public BackOfficeUserDto toDto(UserEntity entity, Authentication auth) {
        return toDto(entity, auth, null, null, null);
    }

    public BackOfficeUserDto toDto(UserEntity entity, Authentication auth, DelivryDriverProfileEntity livreurProfile) {
        return toDto(entity, auth, null, null, livreurProfile);
    }

    public BackOfficeUserDto toDto(UserEntity entity,
                                   Authentication auth,
                                   Customer customerProfile,
                                   Partner partnerProfile,
                                   DelivryDriverProfileEntity livreurProfile) {
        if (entity == null) return null;
        BackOfficeUserDto dto = new BackOfficeUserDto();
        dto.setId(entity.getUserId());
        dto.setPrenom(entity.getFirstName());
        dto.setNom(entity.getLastName());
        dto.setEmail(entity.getEmail());
        dto.setEmailVerifie(entity.isEmailVerified());
        dto.setBlocked(Boolean.TRUE.equals(entity.getBlocked()));
        dto.setRole(resolveRole(entity, auth));
        dto.setDateCreation(entity.getCreatedAt());
        dto.setDateMiseAJour(entity.getUpdatedAt());

        if (customerProfile != null) {
            dto.setTelephone(customerProfile.getPhoneNumber());
            dto.setVille(customerProfile.getCity());
            dto.setPays(customerProfile.getCountry());
            dto.setAvatarUrl(customerProfile.getAvatarUrl());
        } else if (partnerProfile != null) {
            dto.setTelephone(partnerProfile.getPhoneNumber());
            dto.setVille(partnerProfile.getCity());
            dto.setPays(partnerProfile.getCountry());
        } else if (livreurProfile != null) {
            dto.setTelephone(livreurProfile.getPhoneNumber());
            dto.setVille(livreurProfile.getCity());
            dto.setPays(livreurProfile.getCountry());
        }

        dto.setAuthentifications(toAuthDtos(auth));
        return dto;
    }

    public void updateEntityFromDto(BackOfficeUserDto dto, UserEntity entity) {
        if (dto == null || entity == null) return;

        if (dto.getPrenom() != null) {
            entity.setFirstName(dto.getPrenom());
        }
        if (dto.getNom() != null) {
            entity.setLastName(dto.getNom());
        }
        if (dto.getEmail() != null) {
            entity.setEmail(dto.getEmail());
        }
        if (dto.getEmailVerifie() != null) {
            entity.setEmailVerified(dto.getEmailVerifie());
        }
        if (dto.getBlocked() != null) {
            entity.setBlocked(dto.getBlocked());
        }

    }

    public String resolveRole(UserEntity entity, Authentication auth) {
        if (auth != null && auth.getRoles() != null && !auth.getRoles().isEmpty()) {
            if (auth.getRoles().contains(UserRole.SUPER_ADMIN)) return "SUPER_ADMIN";
            if (auth.getRoles().contains(UserRole.LIVREUR)) return "LIVREUR";
            if (auth.getRoles().contains(UserRole.ADMIN)) return "ADMIN";
            if (auth.getRoles().contains(UserRole.PARTNER)) return "PARTENAIRE";
            if (auth.getRoles().contains(UserRole.CUSTOMER)) return "CLIENT";
        }
        return "CLIENT";
    }

    private List<BackOfficeUserAuthDto> toAuthDtos(Authentication auth) {
        if (auth == null || auth.getType() == null) {
            return List.of();
        }
        BackOfficeUserAuthDto dto = BackOfficeUserAuthDto.builder()
                .fournisseur(auth.getType().name())
                .identifiantFournisseur(auth.getUserId())
                .dateCreation(auth.getCreatedAt())
                .build();
        List<BackOfficeUserAuthDto> list = new ArrayList<>();
        list.add(dto);
        return list;
    }
}
