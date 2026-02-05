package com.lifeevent.lid.auth.dto;

import com.lifeevent.lid.user.customer.dto.CustomerDto;
import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthCustomerResponse {
    private String accessToken;
    private CustomerDto loggedCustomer;
}
