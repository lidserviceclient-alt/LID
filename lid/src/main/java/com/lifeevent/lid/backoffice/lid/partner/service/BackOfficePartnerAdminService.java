package com.lifeevent.lid.backoffice.lid.partner.service;

import com.lifeevent.lid.backoffice.lid.partner.dto.BackOfficePartnerAdminDto;
import com.lifeevent.lid.backoffice.lid.partner.dto.BackOfficePartnerTransactionDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerSettingsDto;
import com.lifeevent.lid.common.dto.PageResponse;
import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;

import java.time.LocalDate;
import java.util.List;

public interface BackOfficePartnerAdminService {
    PageResponse<BackOfficePartnerAdminDto> listPartners(int page, int size, String q, List<PartnerRegistrationStatus> statuses);

    BackOfficePartnerSettingsDto getPartner(String partnerId);

    BackOfficePartnerSettingsDto approvePartner(String partnerId);

    BackOfficePartnerSettingsDto rejectPartner(String partnerId, String comment);

    PageResponse<BackOfficePartnerTransactionDto> getPartnerTransactions(String partnerId, LocalDate fromDate, LocalDate toDate, int page, int size);
}
