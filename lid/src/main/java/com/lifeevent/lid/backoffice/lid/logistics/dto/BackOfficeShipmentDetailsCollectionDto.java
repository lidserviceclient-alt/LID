package com.lifeevent.lid.backoffice.lid.logistics.dto;

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
public class BackOfficeShipmentDetailsCollectionDto {
    private List<BackOfficeShipmentDetailDto> shipments;
    private List<Long> missingIds;
}

