package com.lifeevent.lid.user.partner.dto;

import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerRegistrationAggregateDto {
    private PartnerResponseDto partner;
    private PartnerRegisterStep1RequestDto step1;
    private PartnerRegisterStep2RequestDto step2;
    private PartnerRegisterStep3RequestDto step3;
    private PartnerRegisterStep4RequestDto step4;
    private PartnerRegistrationStatus currentStatus;
    private Integer nextStep;
}
