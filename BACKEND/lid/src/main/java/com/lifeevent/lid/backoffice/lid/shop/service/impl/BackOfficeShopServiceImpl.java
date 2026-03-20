package com.lifeevent.lid.backoffice.lid.shop.service.impl;

import com.lifeevent.lid.backoffice.lid.shop.dto.BackOfficeShopDto;
import com.lifeevent.lid.backoffice.lid.shop.service.BackOfficeShopService;
import com.lifeevent.lid.user.partner.entity.Shop;
import com.lifeevent.lid.user.partner.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeShopServiceImpl implements BackOfficeShopService {

    private final ShopRepository shopRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BackOfficeShopDto> getShops() {
        return shopRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    private BackOfficeShopDto toDto(Shop shop) {
        if (shop == null) {
            return null;
        }

        return BackOfficeShopDto.builder()
                .id(shop.getShopId())
                .name(shop.getShopName())
                .description(shop.getDescription())
                .logoUrl(shop.getLogoUrl())
                .backgroundUrl(shop.getBackgroundUrl())
                .status(shop.getStatus() == null ? null : shop.getStatus().name())
                .mainCategoryId(shop.getMainCategory() == null ? null : shop.getMainCategory().getId())
                .mainCategoryName(shop.getMainCategory() == null ? null : shop.getMainCategory().getName())
                .partnerId(shop.getPartner() == null ? null : shop.getPartner().getUserId())
                .partnerEmail(shop.getPartner() == null ? null : shop.getPartner().getEmail())
                .build();
    }
}
