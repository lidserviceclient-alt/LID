package com.lifeevent.lid.backoffice.lid.customer.dto;

import com.lifeevent.lid.common.dto.PageResponse;

import java.util.List;

public record BackOfficeCustomerCollectionDto(
        PageResponse<BackOfficeCustomerDto> customersPage,
        List<String> segments,
        BackOfficeCustomerLoyaltySummaryDto loyaltySummary
) {
}
