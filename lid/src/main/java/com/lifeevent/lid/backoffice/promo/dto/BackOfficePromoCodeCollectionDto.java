package com.lifeevent.lid.backoffice.promo.dto;

import com.lifeevent.lid.backoffice.shop.dto.BackOfficeShopDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficePromoCodeCollectionDto {
    private List<BackOfficePromoCodeDto> promoCodes;
    private List<BackOfficeShopDto> boutiques;
    private PromoCodeStatsDto stats;
}

