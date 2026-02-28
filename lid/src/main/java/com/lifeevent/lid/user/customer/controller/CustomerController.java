package com.lifeevent.lid.user.customer.controller;

import com.lifeevent.lid.cart.service.CartService;
import com.lifeevent.lid.user.customer.dto.CustomerDto;
import com.lifeevent.lid.user.customer.service.CustomerService;
import com.lifeevent.lid.common.util.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController implements ICustomerController {
    
    private final CustomerService customerService;


    @Override
    public ResponseEntity<CustomerDto> createCustomer(@RequestBody CustomerDto dto) {
        CustomerDto created = customerService.createCustomer(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @Override
    public ResponseEntity<CustomerDto> getCustomer(@PathVariable String id) {
        Optional<CustomerDto> customer = customerService.getCustomerById(id);
        return ResponseUtils.getOrNotFound(customer, "Customer", id);
    }
    
    @Override
    public ResponseEntity<List<CustomerDto>> getAllCustomers() {
        List<CustomerDto> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }
    
    @Override
    public ResponseEntity<CustomerDto> getCustomerByEmail(@PathVariable String email) {
        Optional<CustomerDto> customer = customerService.getCustomerByEmail(email);
        return ResponseUtils.getOrNotFound(customer, "Customer", "email", email);
    }

    
    @Override
    public ResponseEntity<CustomerDto> updateCustomer(
            @PathVariable String id,
            @RequestBody CustomerDto dto) {
        CustomerDto updated = customerService.updateCustomer(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @Override
    public ResponseEntity<Void> deleteCustomer(@PathVariable String id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
    
    @Override
    public ResponseEntity<Boolean> emailExists(@PathVariable String email) {
        return ResponseEntity.ok(customerService.emailExists(email));
    }

}
