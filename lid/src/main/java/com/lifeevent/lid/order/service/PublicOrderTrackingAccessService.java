package com.lifeevent.lid.order.service;

import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PublicOrderTrackingAccessService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public boolean canCurrentUserTrack(String reference) {
        String currentUserId = SecurityUtils.getCurrentUserId();
        String ref = reference == null ? "" : reference.trim();
        if (currentUserId == null || "anonymousUser".equals(currentUserId) || ref.isBlank()) {
            return false;
        }

        Long orderId = tryExtractOrderId(ref);
        if (orderId != null && isOwner(orderRepository.findCustomerUserIdByOrderId(orderId), currentUserId)) {
            return true;
        }
        if (isOwner(orderRepository.findCustomerUserIdByOrderNumber(ref), currentUserId)) {
            return true;
        }
        return isOwner(orderRepository.findCustomerUserIdByTrackingNumber(ref), currentUserId);
    }

    private boolean isOwner(Optional<String> ownerUserId, String currentUserId) {
        return ownerUserId.map(currentUserId::equals).orElse(false);
    }

    private Long tryExtractOrderId(String reference) {
        String digits = reference.replaceAll("\\D+", "");
        if (digits.isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(digits);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
