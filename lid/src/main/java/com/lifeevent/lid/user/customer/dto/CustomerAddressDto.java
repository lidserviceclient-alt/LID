package com.lifeevent.lid.user.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAddressDto {
    private String id;
    private String customerId;
    private String type;
    private String name;
    private String addressLine;
    private String city;
    private String postalCode;
    private String country;
    private String phone;
    private Boolean isDefault;
}
