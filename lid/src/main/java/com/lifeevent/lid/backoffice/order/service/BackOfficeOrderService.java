package com.lifeevent.lid.backoffice.order.service;

import com.lifeevent.lid.backoffice.order.dto.BackOfficeCreateOrderRequest;
import com.lifeevent.lid.backoffice.order.dto.BackOfficeOrderQuoteResponse;
import com.lifeevent.lid.backoffice.order.dto.BackOfficeOrderSummaryDto;
import com.lifeevent.lid.backoffice.order.enumeration.BackOfficeOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackOfficeOrderService {
    Page<BackOfficeOrderSummaryDto> getOrders(Pageable pageable, BackOfficeOrderStatus status, String q);
    BackOfficeOrderSummaryDto createOrder(BackOfficeCreateOrderRequest request);
    void updateStatus(Long orderId, BackOfficeOrderStatus status);
    BackOfficeOrderQuoteResponse quote(BackOfficeCreateOrderRequest request);
}
