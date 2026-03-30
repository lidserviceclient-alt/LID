package com.lifeevent.lid.backoffice.lid.order.controller;

import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeCreateOrderRequest;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeOrderCreateBootstrapDto;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeOrderQuoteResponse;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeOrderSummaryDto;
import com.lifeevent.lid.backoffice.lid.order.enumeration.BackOfficeOrderStatus;
import com.lifeevent.lid.backoffice.lid.order.service.BackOfficeOrderBootstrapService;
import com.lifeevent.lid.backoffice.lid.order.service.BackOfficeOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/backoffice/orders")
@RequiredArgsConstructor
public class BackOfficeOrderController implements IBackOfficeOrderController {

    private final BackOfficeOrderService backOfficeOrderService;
    private final BackOfficeOrderBootstrapService backOfficeOrderBootstrapService;

    @Override
    public ResponseEntity<BackOfficeOrderCreateBootstrapDto> getCreateBootstrap(
            int customersPage,
            int customersSize,
            int productsPage,
            int productsSize
    ) {
        return ResponseEntity.ok(backOfficeOrderBootstrapService
                .getCreateBootstrap(customersPage, customersSize, productsPage, productsSize));
    }

    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeOrderSummaryDto>> getOrders(int page, int size, BackOfficeOrderStatus status, String q) {
        //throw new RuntimeException("dsdsdsds");
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(backOfficeOrderService.getOrders(PageRequest.of(page, size), status, q)));
    }

    @Override
    public ResponseEntity<List<BackOfficeOrderSummaryDto>> getRecentOrders() {
        return ResponseEntity.ok(backOfficeOrderService.getRecentOrders());
    }

    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeOrderSummaryDto>> getAllCustomersOrders(int page, int size, BackOfficeOrderStatus status, String q) {
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(backOfficeOrderService.getAllCustomersOrders(PageRequest.of(page, size), status, q)));
    }

    @Override
    public ResponseEntity<com.lifeevent.lid.common.dto.PageResponse<BackOfficeOrderSummaryDto>> getOrdersByCustomer(String customerId, int page, int size, BackOfficeOrderStatus status) {
        return ResponseEntity.ok(com.lifeevent.lid.common.dto.PageResponse.from(backOfficeOrderService.getOrdersByCustomer(customerId, PageRequest.of(page, size), status)));
    }

    @Override
    public ResponseEntity<BackOfficeOrderSummaryDto> createOrder(BackOfficeCreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeOrderService.createOrder(request));
    }

    @Override
    public ResponseEntity<BackOfficeOrderSummaryDto> updateStatus(Long id, Map<String, String> payload) {
        BackOfficeOrderStatus status = parseStatus(payload);
        return ResponseEntity.ok(backOfficeOrderService.updateStatus(id, status));
    }

    @Override
    public ResponseEntity<BackOfficeOrderQuoteResponse> quote(BackOfficeCreateOrderRequest request) {
        return ResponseEntity.ok(backOfficeOrderService.quote(request));
    }

    private BackOfficeOrderStatus parseStatus(Map<String, String> payload) {
        String raw = payload != null ? payload.get("status") : null;
        if (raw == null || raw.isBlank()) {
            return null;
        }
        return BackOfficeOrderStatus.valueOf(raw.trim().toUpperCase(Locale.ROOT));
    }
}
