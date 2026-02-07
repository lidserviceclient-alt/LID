package com.lifeevent.lid.backoffice.order.controller;

import com.lifeevent.lid.backoffice.order.dto.BackOfficeCreateOrderRequest;
import com.lifeevent.lid.backoffice.order.dto.BackOfficeOrderQuoteResponse;
import com.lifeevent.lid.backoffice.order.dto.BackOfficeOrderSummaryDto;
import com.lifeevent.lid.backoffice.order.enumeration.BackOfficeOrderStatus;
import com.lifeevent.lid.backoffice.order.service.BackOfficeOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/back-office/orders")
@RequiredArgsConstructor
public class BackOfficeOrderController implements IBackOfficeOrderController {

    private final BackOfficeOrderService backOfficeOrderService;

    @Override
    public ResponseEntity<Page<BackOfficeOrderSummaryDto>> getOrders(int page, int size, BackOfficeOrderStatus status, String q) {
        return ResponseEntity.ok(backOfficeOrderService.getOrders(PageRequest.of(page, size), status, q));
    }

    @Override
    public ResponseEntity<BackOfficeOrderSummaryDto> createOrder(BackOfficeCreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeOrderService.createOrder(request));
    }

    @Override
    public ResponseEntity<Void> updateStatus(Long id, java.util.Map<String, String> payload) {
        String raw = payload != null ? payload.get("status") : null;
        BackOfficeOrderStatus status = raw == null ? null : BackOfficeOrderStatus.valueOf(raw);
        backOfficeOrderService.updateStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<BackOfficeOrderQuoteResponse> quote(BackOfficeCreateOrderRequest request) {
        return ResponseEntity.ok(backOfficeOrderService.quote(request));
    }
}
