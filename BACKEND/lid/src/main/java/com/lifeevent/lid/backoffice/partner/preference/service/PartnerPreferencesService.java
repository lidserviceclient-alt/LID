package com.lifeevent.lid.backoffice.partner.preference.service;

import com.lifeevent.lid.backoffice.partner.preference.dto.PartnerPreferencesDto;

public interface PartnerPreferencesService {

    PartnerPreferencesDto getMine();

    PartnerPreferencesDto updateMine(PartnerPreferencesDto dto);
}

