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
    private String label;
    private String line1;
    private String line2;
    private String city;
    private String country;
    private String postalCode;
    private String phoneNumber;
    private Boolean isDefault;
}
