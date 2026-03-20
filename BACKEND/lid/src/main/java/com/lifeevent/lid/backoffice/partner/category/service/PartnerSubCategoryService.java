package com.lifeevent.lid.backoffice.partner.category.service;

import com.lifeevent.lid.backoffice.partner.category.dto.PartnerSubCategoryDto;

import java.util.List;

public interface PartnerSubCategoryService {

    List<PartnerSubCategoryDto> listMine();

    PartnerSubCategoryDto createMine(PartnerSubCategoryDto dto);

    PartnerSubCategoryDto getMine(Long id);

    PartnerSubCategoryDto updateMine(Long id, PartnerSubCategoryDto dto);

    void deleteMine(Long id);
}

