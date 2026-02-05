package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.CreateCustomerRequest;
import com.lifeevent.lid.core.dto.CustomerSummaryDto;
import com.lifeevent.lid.core.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/backoffice/customers")
public class CustomersController {

    private final CustomerService customerService;

    public CustomersController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public Page<CustomerSummaryDto> listCustomers(
        @RequestParam(value = "page", defaultValue = "0") int page,
        @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return customerService.listCustomers(pageable);
    }

    @PostMapping
    public CustomerSummaryDto createCustomer(@Valid @org.springframework.web.bind.annotation.RequestBody CreateCustomerRequest request) {
        return customerService.createCustomer(request);
    }
}
