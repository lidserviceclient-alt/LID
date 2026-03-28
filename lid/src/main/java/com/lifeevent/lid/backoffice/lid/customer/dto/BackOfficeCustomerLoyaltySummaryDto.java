package com.lifeevent.lid.backoffice.lid.customer.dto;

public record BackOfficeCustomerLoyaltySummaryDto(
        Long totalCustomers,
        Double totalSpent,
        Double averageSpent
) {
}
