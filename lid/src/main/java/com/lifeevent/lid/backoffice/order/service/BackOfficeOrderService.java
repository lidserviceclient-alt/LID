package com.lifeevent.lid.backoffice.order.service;

import com.lifeevent.lid.backoffice.order.dto.BackOfficeCreateOrderRequest;
import com.lifeevent.lid.backoffice.order.dto.BackOfficeOrderQuoteResponse;
import com.lifeevent.lid.backoffice.order.dto.BackOfficeOrderSummaryDto;
import com.lifeevent.lid.backoffice.order.enumeration.BackOfficeOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BackOfficeOrderService {
    Page<BackOfficeOrderSummaryDto> getOrders(Pageable pageable, BackOfficeOrderStatus status, String q);
    List<BackOfficeOrderSummaryDto> getRecentOrders();
    Page<BackOfficeOrderSummaryDto> getAllCustomersOrders(Pageable pageable, BackOfficeOrderStatus status, String q);
    Page<BackOfficeOrderSummaryDto> getOrdersByCustomer(String customerId, Pageable pageable, BackOfficeOrderStatus status);
    BackOfficeOrderSummaryDto createOrder(BackOfficeCreateOrderRequest request);
    BackOfficeOrderSummaryDto updateStatus(Long orderId, BackOfficeOrderStatus status);
    BackOfficeOrderQuoteResponse quote(BackOfficeCreateOrderRequest request);
}
