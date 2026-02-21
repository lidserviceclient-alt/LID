package com.lifeevent.lid.user.customer.dto;

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
    private String telephone;
    private String ville;
    private String pays;
    private java.time.LocalDateTime createdAt;
}
