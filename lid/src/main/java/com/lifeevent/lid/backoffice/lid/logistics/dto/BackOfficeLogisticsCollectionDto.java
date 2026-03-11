package com.lifeevent.lid.backoffice.lid.logistics.dto;

import com.lifeevent.lid.backoffice.lid.setting.dto.BackOfficeSettingShopProfileDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeLogisticsCollectionDto {
    private LogisticsKpisDto kpis;
    private BackOfficeSettingShopProfileDto appConfig;
    private List<BackOfficeShipmentDto> delivered;
    private Page<BackOfficeShipmentDto> shipmentsPage;
}

