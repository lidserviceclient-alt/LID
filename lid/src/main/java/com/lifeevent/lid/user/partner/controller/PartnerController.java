package com.lifeevent.lid.user.partner.controller;

import com.lifeevent.lid.common.util.ResponseUtils;
import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.user.partner.dto.*;
import com.lifeevent.lid.user.partner.service.PartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Contrôleur Partner - Implémentation
 */
@RestController
@RequestMapping("/api/v1/partners")
@RequiredArgsConstructor
public class PartnerController implements IPartnerController {
    
    private final PartnerService partnerService;
    
    @Override
    public ResponseEntity<PartnerRegisterStep1ResponseDto> registerStep1(@RequestBody PartnerRegisterStep1RequestDto dto) {
        PartnerRegisterStep1ResponseDto created = partnerService.registerStep1(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Override
    public ResponseEntity<PartnerResponseDto> upgradeToPartner(@RequestBody PartnerRegisterStep1RequestDto dto) {
        String userId = SecurityUtils.getCurrentUserId();
        PartnerResponseDto upgraded = partnerService.upgradeCustomerToPartner(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(upgraded);
    }
    
    @Override
    public ResponseEntity<PartnerResponseDto> registerStep2(@RequestBody PartnerRegisterStep2RequestDto dto) {
        PartnerResponseDto updated = partnerService.registerStep2(dto);
        return ResponseEntity.ok(updated);
    }
    
    @Override
    public ResponseEntity<PartnerResponseDto> registerStep3(@RequestBody PartnerRegisterStep3RequestDto dto) {
        PartnerResponseDto updated = partnerService.registerStep3(dto);
        return ResponseEntity.ok(updated);
    }

    @Override
    public ResponseEntity<PartnerResponseDto> registerStep4(@RequestBody PartnerRegisterStep4RequestDto dto) {
        PartnerResponseDto updated = partnerService.registerStep4(dto);
        return ResponseEntity.ok(updated);
    }

    @Override
    public ResponseEntity<PartnerRegistrationAggregateDto> getRegistrationAggregate() {
        return ResponseEntity.ok(partnerService.getRegistrationAggregate());
    }

    @Override
    public ResponseEntity<PartnerResponseDto> getPartner(@PathVariable String partnerId) {
        Optional<PartnerResponseDto> partner = partnerService.getPartnerById(partnerId);
        return ResponseUtils.getOrNotFound(partner, "Partner", partnerId);
    }
    
    @Override
    public ResponseEntity<PartnerResponseDto> updatePartner(
            @PathVariable String partnerId,
            @RequestBody PartnerResponseDto dto) {
        PartnerResponseDto updated = partnerService.updatePartner(partnerId, dto);
        return ResponseEntity.ok(updated);
    }
    
    @Override
    public ResponseEntity<Void> deletePartner(@PathVariable String partnerId) {
        partnerService.deletePartner(partnerId);
        return ResponseEntity.noContent().build();
    }
}
