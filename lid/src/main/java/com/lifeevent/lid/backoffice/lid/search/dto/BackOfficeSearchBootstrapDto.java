package com.lifeevent.lid.backoffice.lid.search.dto;

import com.lifeevent.lid.backoffice.lid.customer.dto.BackOfficeCustomerDto;
import com.lifeevent.lid.backoffice.lid.product.dto.BackOfficeProductDto;
import com.lifeevent.lid.backoffice.lid.user.dto.BackOfficeUserDto;
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
public class BackOfficeSearchBootstrapDto {
    private List<BackOfficeProductDto> products;
    private List<BackOfficeCustomerDto> customers;
    private List<BackOfficeUserDto> users;
}

