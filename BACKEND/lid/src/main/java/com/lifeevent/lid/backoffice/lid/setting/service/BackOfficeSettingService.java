package com.lifeevent.lid.backoffice.lid.setting.service;

import com.lifeevent.lid.backoffice.lid.setting.dto.*;
import com.lifeevent.lid.backoffice.lid.user.dto.BackOfficeUserDto;

import java.util.List;

public interface BackOfficeSettingService {
    BackOfficeSettingPageDto getPage();

    BackOfficeSettingShopProfileDto getShopProfile();
    BackOfficeSettingShopProfileDto updateShopProfile(BackOfficeSettingShopProfileDto dto);

    List<BackOfficeSettingSocialLinkDto> getSocialLinks();
    BackOfficeSettingSocialLinkDto createSocialLink(BackOfficeSettingSocialLinkDto dto);
    BackOfficeSettingSocialLinkDto updateSocialLink(String id, BackOfficeSettingSocialLinkDto dto);
    void deleteSocialLink(String id);

    List<BackOfficeSettingFreeShippingRuleDto> getFreeShippingRules();
    BackOfficeSettingFreeShippingRuleDto createFreeShippingRule(BackOfficeSettingFreeShippingRuleDto dto);
    BackOfficeSettingFreeShippingRuleDto updateFreeShippingRule(String id, BackOfficeSettingFreeShippingRuleDto dto);
    BackOfficeSettingFreeShippingRuleDto enableFreeShippingRule(String id);
    BackOfficeSettingFreeShippingRuleDto disableFreeShippingRule(String id);
    void deleteFreeShippingRule(String id);

    List<BackOfficeSettingShippingMethodDto> getShippingMethods();
    BackOfficeSettingShippingMethodDto createShippingMethod(BackOfficeSettingShippingMethodDto dto);
    BackOfficeSettingShippingMethodDto updateShippingMethod(String id, BackOfficeSettingShippingMethodDto dto);
    BackOfficeSettingShippingMethodDto enableShippingMethod(String id);
    BackOfficeSettingShippingMethodDto disableShippingMethod(String id);
    BackOfficeSettingShippingMethodDto setDefaultShippingMethod(String id);
    void deleteShippingMethod(String id);

    List<BackOfficeUserDto> getCouriers();
    BackOfficeUserDto createCourier(BackOfficeUserDto dto);
    BackOfficeUserDto updateCourier(String id, BackOfficeUserDto dto);
    void deleteCourier(String id);

    List<BackOfficeUserDto> getTeamMembers();
    BackOfficeUserDto createTeamMember(BackOfficeUserDto dto);
    BackOfficeUserDto updateTeamMember(String id, BackOfficeUserDto dto);
    void deleteTeamMember(String id);

    BackOfficeSettingSecurityDto getSecurity();
    BackOfficeSettingSecurityDto updateSecurity(BackOfficeSettingSecurityDto dto);
    byte[] exportSecurityActivityCsv(int size);

    BackOfficeSettingIntegrationsDto getIntegrations();
    BackOfficeSettingIntegrationsDto updateIntegrations(BackOfficeSettingIntegrationsUpdateDto dto);

    List<BackOfficeSettingNotificationPreferenceDto> getNotificationPreferences();
    List<BackOfficeSettingNotificationPreferenceDto> updateNotificationPreferences(
            BackOfficeSettingNotificationPreferencesUpdateDto dto
    );
}
