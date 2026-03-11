package com.lifeevent.lid.backoffice.lid.order.service.impl;

import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeReturnRequestDto;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeReturnRequestItemDto;
import com.lifeevent.lid.backoffice.lid.order.dto.BackOfficeReturnRequestUpdateDto;
import com.lifeevent.lid.backoffice.lid.order.service.BackOfficeReturnRequestService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.order.entity.ReturnRequest;
import com.lifeevent.lid.order.entity.ReturnRequestItem;
import com.lifeevent.lid.order.enumeration.ReturnRequestStatus;
import com.lifeevent.lid.order.repository.ReturnRequestRepository;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import com.lifeevent.lid.user.partner.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeReturnRequestServiceImpl implements BackOfficeReturnRequestService {

    private final ReturnRequestRepository returnRequestRepository;
    private final CustomerRepository customerRepository;
    private final PartnerRepository partnerRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeReturnRequestDto> getAll(ReturnRequestStatus status, String q, Pageable pageable) {
        String query = q == null ? "" : q.trim();
        Page<ReturnRequest> results = findReturns(status, query, pageable);
        return results.map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeReturnRequestDto getById(Long id) {
        return toDto(findByIdOrThrow(id));
    }

    @Override
    public BackOfficeReturnRequestDto updateStatus(Long id, BackOfficeReturnRequestUpdateDto request) {
        ReturnRequest entity = findByIdOrThrow(id);
        if (request == null || request.status() == null) {
            return toDto(entity);
        }
        entity.setStatus(request.status());
        ReturnRequest saved = returnRequestRepository.save(entity);
        return toDto(saved);
    }

    private Page<ReturnRequest> findReturns(ReturnRequestStatus status, String query, Pageable pageable) {
        if (status != null && !query.isBlank()) {
            return returnRequestRepository.searchByStatusAndQuery(status, query, pageable);
        }
        if (status != null) {
            return returnRequestRepository.findByStatus(status, pageable);
        }
        if (!query.isBlank()) {
            return returnRequestRepository.findByOrderNumberContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query, pageable);
        }
        return returnRequestRepository.findAll(pageable);
    }

    private ReturnRequest findByIdOrThrow(Long id) {
        return returnRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReturnRequest", "id", String.valueOf(id)));
    }

    private BackOfficeReturnRequestDto toDto(ReturnRequest entity) {
        List<BackOfficeReturnRequestItemDto> items = entity.getItems() == null
                ? List.of()
                : entity.getItems().stream().map(this::toItem).toList();

        return new BackOfficeReturnRequestDto(
                entity.getId(),
                entity.getOrderNumber(),
                entity.getEmail(),
                resolveCustomerPhone(entity.getEmail()),
                entity.getReason(),
                entity.getDetails(),
                entity.getStatus(),
                entity.getCreatedAt(),
                items
        );
    }

    private BackOfficeReturnRequestItemDto toItem(ReturnRequestItem item) {
        if (item == null) {
            return new BackOfficeReturnRequestItemDto(null, null, "-", 0, null);
        }
        return new BackOfficeReturnRequestItemDto(
                item.getId(),
                item.getArticleId(),
                item.getArticleName(),
                item.getQuantity(),
                item.getUnitPrice()
        );
    }

    private String resolveCustomerPhone(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        return customerRepository.findByEmail(normalized)
                .map(c -> c.getPhoneNumber())
                .or(() -> partnerRepository.findByEmailWithShop(normalized).map(p -> p.getPhoneNumber()))
                .orElse(null);
    }
}
