package com.lifeevent.lid.backoffice.order.dto;

import com.lifeevent.lid.backoffice.customer.dto.BackOfficeCustomerDto;
import com.lifeevent.lid.backoffice.product.dto.BackOfficeProductDto;
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
public class BackOfficeOrderCreateBootstrapDto {
    private List<BackOfficeCustomerDto> customers;
    private List<BackOfficeProductDto> products;
}

