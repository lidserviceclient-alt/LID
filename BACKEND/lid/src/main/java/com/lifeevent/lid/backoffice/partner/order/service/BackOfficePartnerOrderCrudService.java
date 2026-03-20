package com.lifeevent.lid.backoffice.partner.order.service;

import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerOrderDto;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderDetailDto;
import com.lifeevent.lid.backoffice.partner.order.dto.PartnerOrderUpdateRequest;
import org.springframework.data.domain.Page;

public interface BackOfficePartnerOrderCrudService {

    Page<BackOfficePartnerOrderDto> listMine(int page, int size);

    PartnerOrderDetailDto getMine(Long id);

    PartnerOrderDetailDto updateMine(Long id, PartnerOrderUpdateRequest request);

    void cancelMine(Long id, String comment);
}

