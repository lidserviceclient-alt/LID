package com.lifeevent.lid.order.controller;

import com.lifeevent.lid.order.dto.CreateReturnRequestDto;
import com.lifeevent.lid.order.dto.PublicReturnOrderDto;
import com.lifeevent.lid.order.dto.PublicReturnOrderItemDto;
import com.lifeevent.lid.order.dto.ReturnRequestResponseDto;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.order.service.PublicReturnRequestService;
import jakarta.mail.internet.InternetAddress;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/v1/public/returns")
@RequiredArgsConstructor
public class PublicReturnsController {

    private final OrderRepository orderRepository;
    private final PublicReturnRequestService publicReturnRequestService;

    @GetMapping("/order/{orderNumber}")
    @Transactional(readOnly = true)
    public PublicReturnOrderDto getOrderForReturn(@PathVariable String orderNumber, @RequestParam String email) {
        String rawOrderNumber = orderNumber == null ? "" : orderNumber.trim();
        if (rawOrderNumber.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Numéro de commande requis");
        }

        Long orderId = tryExtractOrderId(rawOrderNumber);
        if (orderId == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Numéro de commande invalide");
        }

        String normalizedEmail = normalizeEmail(email);
        validateEmail(normalizedEmail);

        Order order = orderRepository.findWithCustomerAndArticlesById(orderId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Commande introuvable"));

        String expected = normalizeEmail(order.getCustomer() != null ? order.getCustomer().getEmail() : null);
        if (expected.isBlank() || !expected.equalsIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(NOT_FOUND, "Commande introuvable");
        }

        List<PublicReturnOrderItemDto> items = order.getArticles() == null ? List.of() : order.getArticles().stream()
                .filter(line -> line != null && line.getArticle() != null && line.getArticle().getId() != null)
                .map(line -> new PublicReturnOrderItemDto(
                        line.getArticle().getId(),
                        line.getArticle().getName(),
                        line.getQuantity(),
                        line.getPriceAtOrder(),
                        line.getArticle().getImg()
                ))
                .toList();

        return new PublicReturnOrderDto(
                order.getId(),
                "ORD-" + order.getId(),
                order.getAmount(),
                order.getCurrency(),
                items
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public ReturnRequestResponseDto create(@Valid @RequestBody CreateReturnRequestDto request) {
        return publicReturnRequestService.create(request);
    }

    private Long tryExtractOrderId(String orderNumber) {
        String digits = orderNumber.trim().replaceAll("\\D+", "");
        if (digits.isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(digits);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String normalizeEmail(String rawEmail) {
        return rawEmail == null ? "" : rawEmail.trim().toLowerCase(Locale.ROOT);
    }

    private void validateEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Email requis");
        }
        try {
            InternetAddress addr = new InternetAddress(email, true);
            addr.validate();
        } catch (Exception ex) {
            throw new ResponseStatusException(BAD_REQUEST, "Email invalide");
        }
    }

}
