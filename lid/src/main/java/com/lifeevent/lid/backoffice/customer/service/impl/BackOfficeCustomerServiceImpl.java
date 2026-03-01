package com.lifeevent.lid.backoffice.customer.service.impl;

import com.lifeevent.lid.backoffice.customer.dto.BackOfficeCustomerDto;
import com.lifeevent.lid.backoffice.customer.mapper.BackOfficeCustomerMapper;
import com.lifeevent.lid.backoffice.customer.service.BackOfficeCustomerService;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import com.lifeevent.lid.user.common.repository.UserEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import static org.springframework.http.HttpStatus.CONFLICT;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BackOfficeCustomerServiceImpl implements BackOfficeCustomerService {

    private final CustomerRepository customerRepository;
    private final UserEntityRepository userEntityRepository;
    private final OrderRepository orderRepository;
    private final BackOfficeCustomerMapper backOfficeCustomerMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeCustomerDto> getAll(Pageable pageable) {
        List<Customer> customers = customerRepository.findAll();
        if (customers.isEmpty()) {
            return Page.empty(pageable);
        }

        List<BackOfficeCustomerDto> dtos = new ArrayList<>();
        for (Customer customer : customers) {
            BackOfficeCustomerDto dto = backOfficeCustomerMapper.toDto(customer);
            hydrateMetrics(dto, customer.getUserId());
            dtos.add(dto);
        }

        int total = dtos.size();
        int start = Math.toIntExact(pageable.getOffset());
        if (start >= total) {
            return new PageImpl<>(List.of(), pageable, total);
        }
        int end = Math.min(start + pageable.getPageSize(), total);
        return new PageImpl<>(dtos.subList(start, end), pageable, total);
    }

    @Override
    public BackOfficeCustomerDto create(BackOfficeCustomerDto dto) {
        String email = normalizeEmail(dto);
        ensureEmailIsAvailable(email);

        String userId = resolveUserId(dto);
        Customer customer = toCustomerEntity(dto, userId, email);
        Customer saved = customerRepository.save(customer);

        BackOfficeCustomerDto out = backOfficeCustomerMapper.toDto(saved);
        out.setOrders(0);
        out.setSpent(0d);
        out.setLastOrder(null);
        return out;
    }

    private void hydrateMetrics(BackOfficeCustomerDto dto, String customerId) {
        List<Order> orders = orderRepository.findByCustomer_UserId(customerId);
        if (orders == null || orders.isEmpty()) {
            dto.setOrders(0);
            dto.setSpent(0d);
            dto.setLastOrder(null);
            return;
        }
        int count = orders.size();
        double spent = 0d;
        LocalDateTime last = null;
        for (Order order : orders) {
            if (order.getAmount() != null) {
                spent += order.getAmount();
            }
            LocalDateTime createdAt = order.getCreatedAt();
            if (createdAt != null && (last == null || createdAt.isAfter(last))) {
                last = createdAt;
            }
        }
        dto.setOrders(count);
        dto.setSpent(spent);
        dto.setLastOrder(last);
    }

    private String normalizeEmail(BackOfficeCustomerDto dto) {
        if (dto == null || dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new IllegalArgumentException("email requis");
        }
        return dto.getEmail().trim().toLowerCase(Locale.ROOT);
    }

    private void ensureEmailIsAvailable(String email) {
        if (userEntityRepository.existsByEmail(email)) {
            throw new ResponseStatusException(CONFLICT, "Email deja utilise");
        }
    }

    private String resolveUserId(BackOfficeCustomerDto dto) {
        if (dto != null && dto.getId() != null && !dto.getId().isBlank()) {
            return dto.getId();
        }
        return UUID.randomUUID().toString();
    }

    private Customer toCustomerEntity(BackOfficeCustomerDto dto, String userId, String email) {
        Customer customer = backOfficeCustomerMapper.toEntity(dto, userId);
        if (customer.getEmail() == null || customer.getEmail().isBlank()) {
            customer.setEmail(email);
        } else {
            customer.setEmail(customer.getEmail().trim().toLowerCase(Locale.ROOT));
        }
        customer.setEmailVerified(Boolean.FALSE);
        if (customer.getBlocked() == null) {
            customer.setBlocked(Boolean.FALSE);
        }
        return customer;
    }
}
