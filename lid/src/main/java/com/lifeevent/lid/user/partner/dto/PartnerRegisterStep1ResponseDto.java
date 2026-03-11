package com.lifeevent.lid.user.partner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerRegisterStep1ResponseDto {
    private PartnerResponseDto partner;
    private String accessToken;
}
