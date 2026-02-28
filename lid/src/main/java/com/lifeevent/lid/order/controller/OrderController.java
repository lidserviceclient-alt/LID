package com.lifeevent.lid.order.controller;

import com.lifeevent.lid.order.dto.CheckoutCartRequestDto;
import com.lifeevent.lid.order.dto.CheckoutCartSelectedRequestDto;
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
    @PostMapping("/checkout/cart")
    public ResponseEntity<CheckoutResponseDto> checkoutCart(String customerId, CheckoutCartRequestDto request) {
        CheckoutResponseDto response = orderService.checkoutCart(customerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    @PostMapping("/checkout/selected")
    public ResponseEntity<CheckoutResponseDto> checkoutSelectedArticles(String customerId, CheckoutCartSelectedRequestDto request) {
        CheckoutResponseDto response = orderService.checkoutSelectedArticles(customerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @Override
    @GetMapping("/orders")
    public ResponseEntity<List<OrderDetailDto>> getCustomerOrders(String customerId, int page, int size) {
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
