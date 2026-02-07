package com.lifeevent.lid.backoffice.user.mapper;

import com.lifeevent.lid.auth.constant.UserRole;
import com.lifeevent.lid.auth.entity.Authentication;
import com.lifeevent.lid.backoffice.user.dto.BackOfficeUserAuthDto;
import com.lifeevent.lid.backoffice.user.dto.BackOfficeUserDto;
import com.lifeevent.lid.user.common.entity.UserEntity;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.partner.entity.Partner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class BackOfficeUserMapper {

    public BackOfficeUserDto toDto(UserEntity entity, Authentication auth) {
        if (entity == null) return null;
        BackOfficeUserDto dto = new BackOfficeUserDto();
        dto.setId(entity.getUserId());
        dto.setPrenom(entity.getFirstName());
        dto.setNom(entity.getLastName());
        dto.setEmail(entity.getEmail());
        dto.setEmailVerifie(entity.isEmailVerified());
        dto.setRole(resolveRole(entity, auth));
        dto.setDateCreation(entity.getCreatedAt());
        dto.setDateMiseAJour(entity.getUpdatedAt());

        if (entity instanceof Customer customer) {
            dto.setTelephone(customer.getPhoneNumber());
            dto.setVille(customer.getCity());
            dto.setPays(customer.getCountry());
            dto.setAvatarUrl(customer.getAvatarUrl());
        } else if (entity instanceof Partner partner) {
            dto.setTelephone(partner.getPhoneNumber());
            dto.setVille(partner.getCity());
            dto.setPays(partner.getCountry());
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

        if (entity instanceof Customer customer) {
            if (dto.getTelephone() != null) customer.setPhoneNumber(dto.getTelephone());
            if (dto.getVille() != null) customer.setCity(dto.getVille());
            if (dto.getPays() != null) customer.setCountry(dto.getPays());
            if (dto.getAvatarUrl() != null) customer.setAvatarUrl(dto.getAvatarUrl());
        } else if (entity instanceof Partner partner) {
            if (dto.getTelephone() != null) partner.setPhoneNumber(dto.getTelephone());
            if (dto.getVille() != null) partner.setCity(dto.getVille());
            if (dto.getPays() != null) partner.setCountry(dto.getPays());
        }
    }

    public String resolveRole(UserEntity entity, Authentication auth) {
        if (auth != null && auth.getRoles() != null && !auth.getRoles().isEmpty()) {
            if (auth.getRoles().contains(UserRole.ADMIN)) return "ADMIN";
            if (auth.getRoles().contains(UserRole.PARTNER)) return "PARTENAIRE";
            if (auth.getRoles().contains(UserRole.CUSTOMER)) return "CLIENT";
        }
        if (entity instanceof Partner) return "PARTENAIRE";
        if (entity instanceof Customer) return "CLIENT";
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
