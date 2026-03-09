package com.lifeevent.lid.backoffice.setting.controller;

import com.lifeevent.lid.backoffice.setting.dto.*;
import com.lifeevent.lid.backoffice.setting.service.BackOfficeSettingService;
import com.lifeevent.lid.backoffice.user.dto.BackOfficeUserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/backoffice/setting", "/api/backoffice/setting"})
@RequiredArgsConstructor
public class BackOfficeSettingController implements IBackOfficeSettingController {

    private final BackOfficeSettingService backOfficeSettingService;

    @Override
    public ResponseEntity<BackOfficeSettingPageDto> getSettingsPage() {
        return ResponseEntity.ok(backOfficeSettingService.getPage());
    }

    @Override
    public ResponseEntity<BackOfficeSettingPageDto> getSettingsCollection() {
        return ResponseEntity.ok(backOfficeSettingService.getPage());
    }

    @Override
    public ResponseEntity<BackOfficeSettingShopProfileDto> getShopProfile() {
        return ResponseEntity.ok(backOfficeSettingService.getShopProfile());
    }

    @Override
    public ResponseEntity<BackOfficeSettingShopProfileDto> updateShopProfile(@RequestBody BackOfficeSettingShopProfileDto dto) {
        return ResponseEntity.ok(backOfficeSettingService.updateShopProfile(dto));
    }

    @Override
    public ResponseEntity<List<BackOfficeSettingSocialLinkDto>> getSocialLinks() {
        return ResponseEntity.ok(backOfficeSettingService.getSocialLinks());
    }

    @Override
    public ResponseEntity<BackOfficeSettingSocialLinkDto> createSocialLink(@RequestBody BackOfficeSettingSocialLinkDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeSettingService.createSocialLink(dto));
    }

    @Override
    public ResponseEntity<BackOfficeSettingSocialLinkDto> updateSocialLink(
            @PathVariable String id,
            @RequestBody BackOfficeSettingSocialLinkDto dto
    ) {
        return ResponseEntity.ok(backOfficeSettingService.updateSocialLink(id, dto));
    }

    @Override
    public ResponseEntity<Void> deleteSocialLink(@PathVariable String id) {
        backOfficeSettingService.deleteSocialLink(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<BackOfficeSettingFreeShippingRuleDto>> getFreeShippingRules() {
        return ResponseEntity.ok(backOfficeSettingService.getFreeShippingRules());
    }

    @Override
    public ResponseEntity<BackOfficeSettingFreeShippingRuleDto> createFreeShippingRule(
            @RequestBody BackOfficeSettingFreeShippingRuleDto dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeSettingService.createFreeShippingRule(dto));
    }

    @Override
    public ResponseEntity<BackOfficeSettingFreeShippingRuleDto> updateFreeShippingRule(
            @PathVariable String id,
            @RequestBody BackOfficeSettingFreeShippingRuleDto dto
    ) {
        return ResponseEntity.ok(backOfficeSettingService.updateFreeShippingRule(id, dto));
    }

    @Override
    public ResponseEntity<BackOfficeSettingFreeShippingRuleDto> enableFreeShippingRule(@PathVariable String id) {
        return ResponseEntity.ok(backOfficeSettingService.enableFreeShippingRule(id));
    }

    @Override
    public ResponseEntity<BackOfficeSettingFreeShippingRuleDto> disableFreeShippingRule(@PathVariable String id) {
        return ResponseEntity.ok(backOfficeSettingService.disableFreeShippingRule(id));
    }

    @Override
    public ResponseEntity<Void> deleteFreeShippingRule(@PathVariable String id) {
        backOfficeSettingService.deleteFreeShippingRule(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<BackOfficeSettingShippingMethodDto>> getShippingMethods() {
        return ResponseEntity.ok(backOfficeSettingService.getShippingMethods());
    }

    @Override
    public ResponseEntity<BackOfficeSettingShippingMethodDto> createShippingMethod(
            @RequestBody BackOfficeSettingShippingMethodDto dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeSettingService.createShippingMethod(dto));
    }

    @Override
    public ResponseEntity<BackOfficeSettingShippingMethodDto> updateShippingMethod(
            @PathVariable String id,
            @RequestBody BackOfficeSettingShippingMethodDto dto
    ) {
        return ResponseEntity.ok(backOfficeSettingService.updateShippingMethod(id, dto));
    }

    @Override
    public ResponseEntity<BackOfficeSettingShippingMethodDto> enableShippingMethod(@PathVariable String id) {
        return ResponseEntity.ok(backOfficeSettingService.enableShippingMethod(id));
    }

    @Override
    public ResponseEntity<BackOfficeSettingShippingMethodDto> disableShippingMethod(@PathVariable String id) {
        return ResponseEntity.ok(backOfficeSettingService.disableShippingMethod(id));
    }

    @Override
    public ResponseEntity<BackOfficeSettingShippingMethodDto> setDefaultShippingMethod(@PathVariable String id) {
        return ResponseEntity.ok(backOfficeSettingService.setDefaultShippingMethod(id));
    }

    @Override
    public ResponseEntity<Void> deleteShippingMethod(@PathVariable String id) {
        backOfficeSettingService.deleteShippingMethod(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<BackOfficeUserDto>> getCouriers() {
        return ResponseEntity.ok(backOfficeSettingService.getCouriers());
    }

    @Override
    public ResponseEntity<BackOfficeUserDto> createCourier(@RequestBody BackOfficeUserDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeSettingService.createCourier(dto));
    }

    @Override
    public ResponseEntity<BackOfficeUserDto> updateCourier(
            @PathVariable String id,
            @RequestBody BackOfficeUserDto dto
    ) {
        return ResponseEntity.ok(backOfficeSettingService.updateCourier(id, dto));
    }

    @Override
    public ResponseEntity<Void> deleteCourier(@PathVariable String id) {
        backOfficeSettingService.deleteCourier(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<BackOfficeUserDto>> getTeamMembers() {
        return ResponseEntity.ok(backOfficeSettingService.getTeamMembers());
    }

    @Override
    public ResponseEntity<BackOfficeUserDto> createTeamMember(@RequestBody BackOfficeUserDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeSettingService.createTeamMember(dto));
    }

    @Override
    public ResponseEntity<BackOfficeUserDto> updateTeamMember(
            @PathVariable String id,
            @RequestBody BackOfficeUserDto dto
    ) {
        return ResponseEntity.ok(backOfficeSettingService.updateTeamMember(id, dto));
    }

    @Override
    public ResponseEntity<Void> deleteTeamMember(@PathVariable String id) {
        backOfficeSettingService.deleteTeamMember(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<BackOfficeSettingSecurityDto> getSecurity() {
        return ResponseEntity.ok(backOfficeSettingService.getSecurity());
    }

    @Override
    public ResponseEntity<BackOfficeSettingSecurityDto> updateSecurity(@RequestBody BackOfficeSettingSecurityDto dto) {
        return ResponseEntity.ok(backOfficeSettingService.updateSecurity(dto));
    }

    @Override
    public ResponseEntity<byte[]> exportSecurityActivityCsv(@RequestParam(defaultValue = "500") int size) {
        byte[] csv = backOfficeSettingService.exportSecurityActivityCsv(size);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=security-activity.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @Override
    public ResponseEntity<BackOfficeSettingIntegrationsDto> getIntegrations() {
        return ResponseEntity.ok(backOfficeSettingService.getIntegrations());
    }

    @Override
    public ResponseEntity<BackOfficeSettingIntegrationsDto> updateIntegrations(@RequestBody BackOfficeSettingIntegrationsUpdateDto dto) {
        return ResponseEntity.ok(backOfficeSettingService.updateIntegrations(dto));
    }

    @Override
    public ResponseEntity<List<BackOfficeSettingNotificationPreferenceDto>> getNotificationPreferences() {
        return ResponseEntity.ok(backOfficeSettingService.getNotificationPreferences());
    }

    @Override
    public ResponseEntity<List<BackOfficeSettingNotificationPreferenceDto>> updateNotificationPreferences(
            @RequestBody BackOfficeSettingNotificationPreferencesUpdateDto dto
    ) {
        return ResponseEntity.ok(backOfficeSettingService.updateNotificationPreferences(dto));
    }
}
