package com.lifeevent.lid.user.customer.controller;

import com.lifeevent.lid.cart.service.CartService;
import com.lifeevent.lid.user.customer.dto.CustomerDto;
import com.lifeevent.lid.user.customer.service.CustomerService;
import com.lifeevent.lid.common.util.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController implements ICustomerController {
    
    private final CustomerService customerService;
    private final CartService cartService;
    
    @Override
    @PostMapping
    @PreAuthorize("permitAll")
    public ResponseEntity<CustomerDto> createCustomer(@RequestBody CustomerDto dto) {
        CustomerDto created = customerService.createCustomer(dto);
        cartService.createCart(created.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @Override
    @GetMapping("/{id}")
    @PreAuthorize("(#id == authentication.name) or hasRole('ADMIN')")
    public ResponseEntity<CustomerDto> getCustomer(@PathVariable String id) {
        Optional<CustomerDto> customer = customerService.getCustomerById(id);
        return ResponseUtils.getOrNotFound(customer, "Customer", id);
    }
    
    @Override
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CustomerDto>> getAllCustomers() {
        List<CustomerDto> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }
    
    @Override
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomerDto> getCustomerByEmail(@PathVariable String email) {
        Optional<CustomerDto> customer = customerService.getCustomerByEmail(email);
        return ResponseUtils.getOrNotFound(customer, "Customer", "email", email);
    }

    
    @Override
    @PutMapping("/{id}")
    @PreAuthorize("(#id == authentication.name) or hasRole('ADMIN')")
    public ResponseEntity<CustomerDto> updateCustomer(
            @PathVariable String id,
            @RequestBody CustomerDto dto) {
        CustomerDto updated = customerService.updateCustomer(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @Override
    @DeleteMapping("/{id}")
    @PreAuthorize("(#id == authentication.name) or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCustomer(@PathVariable String id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
    
    @Override
    @GetMapping("/check-email/{email}")
    @PreAuthorize("permitAll")
    public ResponseEntity<Boolean> emailExists(@PathVariable String email) {
        return ResponseEntity.ok(customerService.emailExists(email));
    }

}
