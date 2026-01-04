package com.lifeevent.lid.customer.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDto {
    private Integer id;
    private String login;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
}
