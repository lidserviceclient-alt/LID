package com.lifeevent.lid.user.customer.dto;

import jakarta.persistence.Column;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDto {
    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    private String avatarUrl;
    private String phoneNumber;
    private String city;
    private String country;
}
