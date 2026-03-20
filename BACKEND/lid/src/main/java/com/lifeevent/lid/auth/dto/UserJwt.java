package com.lifeevent.lid.auth.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Builder
@Getter @Setter
public class UserJwt {
    private String userId;
    private String email;
    private Boolean emailVerified;
    private String fullName;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private List<String> roles;
}
