package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.CreateBackofficeOrderRequest;
import com.lifeevent.lid.core.dto.OrderQuoteRequest;
import com.lifeevent.lid.core.dto.OrderQuoteResponse;
import com.lifeevent.lid.core.dto.OrderSummaryDto;
import com.lifeevent.lid.core.dto.UpdateOrderStatusRequest;
import com.lifeevent.lid.core.enums.StatutCommande;
import com.lifeevent.lid.core.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/backoffice/orders")
public class OrdersController {

    private final OrderService orderService;

    public OrdersController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public Page<OrderSummaryDto> listOrders(
        @RequestParam(value = "status", required = false) StatutCommande status,
        @RequestParam(value = "q", required = false) String q,
        @RequestParam(value = "page", defaultValue = "0") int page,
        @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return orderService.listOrders(status, q, pageable);
    }

    @GetMapping("/recent")
    public List<OrderSummaryDto> recentOrders() {
        return orderService.recentOrders();
    }

    @PostMapping
    public OrderSummaryDto createOrder(@org.springframework.web.bind.annotation.RequestBody CreateBackofficeOrderRequest request) {
        return orderService.createBackofficeOrder(request);
    }

    @PostMapping("/quote")
    public OrderQuoteResponse quote(@Valid @RequestBody OrderQuoteRequest request) {
        return orderService.quote(request);
    }

    @PutMapping("/{id}/status")
    public OrderSummaryDto updateStatus(@PathVariable("id") String id,
                                        @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateStatus(id, request.getStatus());
    }
}
