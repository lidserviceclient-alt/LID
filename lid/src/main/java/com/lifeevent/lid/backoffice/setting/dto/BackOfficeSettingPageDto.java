package com.lifeevent.lid.backoffice.setting.dto;

import com.lifeevent.lid.backoffice.user.dto.BackOfficeUserDto;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackOfficeSettingPageDto {
    private BackOfficeSettingShopProfileDto shopProfile;
    private List<BackOfficeSettingSocialLinkDto> socialLinks;
    private List<BackOfficeSettingFreeShippingRuleDto> freeShippingRules;
    private List<BackOfficeSettingShippingMethodDto> shippingMethods;
    private List<BackOfficeUserDto> couriers;
    private List<BackOfficeUserDto> teamMembers;
    private BackOfficeSettingSecurityDto security;
    private BackOfficeSettingIntegrationsDto integrations;
    private List<BackOfficeSettingNotificationPreferenceDto> notificationPreferences;
}
