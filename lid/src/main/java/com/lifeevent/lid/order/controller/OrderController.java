package com.lifeevent.lid.order.controller;

import com.lifeevent.lid.core.dto.OrderQuoteResponse;
import com.lifeevent.lid.order.dto.CheckoutRequestDto;
import com.lifeevent.lid.order.dto.CheckoutResponseDto;
import com.lifeevent.lid.order.dto.OrderDetailDto;
import com.lifeevent.lid.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class OrderController implements IOrderController {
    
    private final OrderService orderService;
    
    @Override
    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponseDto> checkout(
            @RequestParam String customerId,
            @RequestBody CheckoutRequestDto request
    ) {
        CheckoutResponseDto response = orderService.checkout(customerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    @PostMapping("/checkout/quote")
    public ResponseEntity<OrderQuoteResponse> quoteCheckout(
            @RequestParam String customerId,
            @RequestBody CheckoutRequestDto request
    ) {
        OrderQuoteResponse response = orderService.quoteCheckout(customerId, request);
        return ResponseEntity.ok(response);
    }
    
    @Override
    @GetMapping("/orders")
    public ResponseEntity<List<OrderDetailDto>> getCustomerOrders(
            @RequestParam String customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<OrderDetailDto> orders = orderService.getOrdersByCustomer(customerId, page, size);
        return ResponseEntity.ok(orders);
    }
    
    @Override
    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderDetail(@PathVariable Long id) {
        return orderService.getOrderById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @Override
    @GetMapping("/orders/{id}/tracking")
    public ResponseEntity<?> getOrderTracking(@PathVariable Long id) {
        return orderService.getOrderById(id)
            .map(order -> ResponseEntity.ok(new Object() {
                public final String trackingNumber = order.getTrackingNumber();
                public final Object status = order.getCurrentStatus();
                public final java.time.LocalDateTime updatedAt = order.getCreatedAt();
            }))
            .orElse(ResponseEntity.notFound().build());
    }
}
