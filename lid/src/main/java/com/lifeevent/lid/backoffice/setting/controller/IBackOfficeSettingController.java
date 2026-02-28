package com.lifeevent.lid.backoffice.setting.controller;

import com.lifeevent.lid.backoffice.setting.dto.*;
import com.lifeevent.lid.backoffice.user.dto.BackOfficeUserDto;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "BackOffice - Settings", description = "API back-office pour la page paramètres")
public interface IBackOfficeSettingController {

    @GetMapping
    ResponseEntity<BackOfficeSettingPageDto> getSettingsPage();

    @GetMapping("/shop-profile")
    ResponseEntity<BackOfficeSettingShopProfileDto> getShopProfile();
    @PutMapping("/shop-profile")
    ResponseEntity<BackOfficeSettingShopProfileDto> updateShopProfile(@RequestBody BackOfficeSettingShopProfileDto dto);

    @GetMapping("/social-links")
    ResponseEntity<List<BackOfficeSettingSocialLinkDto>> getSocialLinks();
    @PostMapping("/social-links")
    ResponseEntity<BackOfficeSettingSocialLinkDto> createSocialLink(@RequestBody BackOfficeSettingSocialLinkDto dto);
    @PutMapping("/social-links/{id}")
    ResponseEntity<BackOfficeSettingSocialLinkDto> updateSocialLink(
            @PathVariable String id,
            @RequestBody BackOfficeSettingSocialLinkDto dto
    );
    @DeleteMapping("/social-links/{id}")
    ResponseEntity<Void> deleteSocialLink(@PathVariable String id);

    @GetMapping("/free-shipping-rules")
    ResponseEntity<List<BackOfficeSettingFreeShippingRuleDto>> getFreeShippingRules();
    @PostMapping("/free-shipping-rules")
    ResponseEntity<BackOfficeSettingFreeShippingRuleDto> createFreeShippingRule(@RequestBody BackOfficeSettingFreeShippingRuleDto dto);
    @PutMapping("/free-shipping-rules/{id}")
    ResponseEntity<BackOfficeSettingFreeShippingRuleDto> updateFreeShippingRule(
            @PathVariable String id,
            @RequestBody BackOfficeSettingFreeShippingRuleDto dto
    );
    @PostMapping("/free-shipping-rules/{id}/enable")
    ResponseEntity<BackOfficeSettingFreeShippingRuleDto> enableFreeShippingRule(@PathVariable String id);
    @PostMapping("/free-shipping-rules/{id}/disable")
    ResponseEntity<BackOfficeSettingFreeShippingRuleDto> disableFreeShippingRule(@PathVariable String id);
    @DeleteMapping("/free-shipping-rules/{id}")
    ResponseEntity<Void> deleteFreeShippingRule(@PathVariable String id);

    @GetMapping("/shipping-methods")
    ResponseEntity<List<BackOfficeSettingShippingMethodDto>> getShippingMethods();
    @PostMapping("/shipping-methods")
    ResponseEntity<BackOfficeSettingShippingMethodDto> createShippingMethod(@RequestBody BackOfficeSettingShippingMethodDto dto);
    @PutMapping("/shipping-methods/{id}")
    ResponseEntity<BackOfficeSettingShippingMethodDto> updateShippingMethod(
            @PathVariable String id,
            @RequestBody BackOfficeSettingShippingMethodDto dto
    );
    @PostMapping("/shipping-methods/{id}/enable")
    ResponseEntity<BackOfficeSettingShippingMethodDto> enableShippingMethod(@PathVariable String id);
    @PostMapping("/shipping-methods/{id}/disable")
    ResponseEntity<BackOfficeSettingShippingMethodDto> disableShippingMethod(@PathVariable String id);
    @PostMapping("/shipping-methods/{id}/default")
    ResponseEntity<BackOfficeSettingShippingMethodDto> setDefaultShippingMethod(@PathVariable String id);
    @DeleteMapping("/shipping-methods/{id}")
    ResponseEntity<Void> deleteShippingMethod(@PathVariable String id);

    @GetMapping("/couriers")
    ResponseEntity<List<BackOfficeUserDto>> getCouriers();
    @PostMapping("/couriers")
    ResponseEntity<BackOfficeUserDto> createCourier(@RequestBody BackOfficeUserDto dto);
    @PutMapping("/couriers/{id}")
    ResponseEntity<BackOfficeUserDto> updateCourier(@PathVariable String id, @RequestBody BackOfficeUserDto dto);
    @DeleteMapping("/couriers/{id}")
    ResponseEntity<Void> deleteCourier(@PathVariable String id);

    @GetMapping("/team-members")
    ResponseEntity<List<BackOfficeUserDto>> getTeamMembers();
    @PostMapping("/team-members")
    ResponseEntity<BackOfficeUserDto> createTeamMember(@RequestBody BackOfficeUserDto dto);
    @PutMapping("/team-members/{id}")
    ResponseEntity<BackOfficeUserDto> updateTeamMember(@PathVariable String id, @RequestBody BackOfficeUserDto dto);
    @DeleteMapping("/team-members/{id}")
    ResponseEntity<Void> deleteTeamMember(@PathVariable String id);

    @GetMapping("/security")
    ResponseEntity<BackOfficeSettingSecurityDto> getSecurity();
    @PutMapping("/security")
    ResponseEntity<BackOfficeSettingSecurityDto> updateSecurity(@RequestBody BackOfficeSettingSecurityDto dto);
    @GetMapping(value = "/security/activity/export", produces = "text/csv")
    ResponseEntity<byte[]> exportSecurityActivityCsv(@RequestParam(defaultValue = "500") int size);

    @GetMapping("/integrations")
    ResponseEntity<BackOfficeSettingIntegrationsDto> getIntegrations();
    @PutMapping("/integrations")
    ResponseEntity<BackOfficeSettingIntegrationsDto> updateIntegrations(@RequestBody BackOfficeSettingIntegrationsUpdateDto dto);

    @GetMapping("/notification-preferences")
    ResponseEntity<List<BackOfficeSettingNotificationPreferenceDto>> getNotificationPreferences();
    @PutMapping("/notification-preferences")
    ResponseEntity<List<BackOfficeSettingNotificationPreferenceDto>> updateNotificationPreferences(
            @RequestBody BackOfficeSettingNotificationPreferencesUpdateDto dto
    );
}
