package com.lifeevent.lid.backoffice.shop.controller;

import com.lifeevent.lid.backoffice.shop.dto.BackOfficeShopDto;
import com.lifeevent.lid.backoffice.shop.service.BackOfficeShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({
        "/api/v1/backoffice/shops",
        "/api/backoffice/shops",
        "/api/v1/backoffice/boutiques",
        "/api/backoffice/boutiques"
})
@RequiredArgsConstructor
public class BackOfficeShopController implements IBackOfficeShopController {

    private final BackOfficeShopService backOfficeShopService;

    @Override
    public ResponseEntity<List<BackOfficeShopDto>> getShops() {
        return ResponseEntity.ok(backOfficeShopService.getShops());
    }
}
