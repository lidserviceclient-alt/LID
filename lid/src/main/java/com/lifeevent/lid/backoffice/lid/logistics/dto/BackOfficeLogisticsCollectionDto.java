package com.lifeevent.lid.backoffice.lid.logistics.dto;

import com.lifeevent.lid.backoffice.lid.setting.dto.BackOfficeSettingShopProfileDto;
import com.lifeevent.lid.common.dto.PageResponse;
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
public class BackOfficeLogisticsCollectionDto {
    private LogisticsKpisDto kpis;
    private BackOfficeSettingShopProfileDto appConfig;
    private PageResponse<BackOfficeShipmentDto> shipmentsPage;
    private PageResponse<BackOfficeShipmentDto> deliveredPage;
    private List<BackOfficeShipmentDto> delivered;
}
