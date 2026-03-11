package com.lifeevent.lid.backoffice.lid.shop.controller;

import com.lifeevent.lid.backoffice.lid.shop.dto.BackOfficeShopDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

public interface IBackOfficeShopController {

    @GetMapping
    ResponseEntity<List<BackOfficeShopDto>> getShops();
}
