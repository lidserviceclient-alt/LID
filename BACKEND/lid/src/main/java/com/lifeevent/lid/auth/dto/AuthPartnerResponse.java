package com.lifeevent.lid.auth.dto;

import com.lifeevent.lid.user.partner.dto.PartnerResponseDto;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthPartnerResponse {
    private String accessToken;
    private PartnerResponseDto loggedPartner;
}
