package com.lifeevent.lid.backoffice.partner.dto;

import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;
import com.lifeevent.lid.user.partner.entity.ShopStatusEnum;

public record BackOfficePartnerSettingsDto(
        String partnerId,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        Long shopId,
        String shopName,
        String shopDescription,
        String description,
        String logoUrl,
        String backgroundUrl,
        ShopStatusEnum shopStatus,
        Integer mainCategoryId,
        String bankName,
        String accountHolder,
        String rib,
        String iban,
        String swift,
        String headOfficeAddress,
        String city,
        String country,
        Boolean contractAccepted,
        String businessRegistrationDocumentUrl,
        String idDocumentUrl,
        String nineaDocumentUrl,
        PartnerRegistrationStatus registrationStatus,
        String registrationReviewComment
) {
}
