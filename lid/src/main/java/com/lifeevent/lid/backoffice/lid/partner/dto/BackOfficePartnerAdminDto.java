package com.lifeevent.lid.backoffice.lid.partner.dto;

import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;

import java.time.LocalDateTime;

public record BackOfficePartnerAdminDto(
        String partnerId,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        Long shopId,
        String shopName,
        Integer mainCategoryId,
        String mainCategoryName,
        PartnerRegistrationStatus registrationStatus,
        Boolean contractAccepted,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
