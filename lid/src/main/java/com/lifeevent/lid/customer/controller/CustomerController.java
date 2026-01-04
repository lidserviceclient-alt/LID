package com.lifeevent.lid.customer.controller;

import com.lifeevent.lid.cart.service.CartService;
import com.lifeevent.lid.customer.dto.CustomerDto;
import com.lifeevent.lid.customer.service.CustomerService;
import com.lifeevent.lid.common.util.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController implements ICustomerController {
    
    private final CustomerService customerService;
    private final CartService cartService;
    
    @Override
    public ResponseEntity<CustomerDto> createCustomer(@RequestBody CustomerDto dto) {
        CustomerDto created = customerService.createCustomer(dto);
        cartService.createCart(created.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @Override
    public ResponseEntity<CustomerDto> getCustomer(@PathVariable Integer id) {
        Optional<CustomerDto> customer = customerService.getCustomerById(id);
        return ResponseUtils.getOrNotFound(customer, "Customer", id.toString());
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
    public ResponseEntity<CustomerDto> getCustomerByLogin(@PathVariable String login) {
        Optional<CustomerDto> customer = customerService.getCustomerByLogin(login);
        return ResponseUtils.getOrNotFound(customer, "Customer", "login", login);
    }
    
    @Override
    public ResponseEntity<CustomerDto> updateCustomer(
            @PathVariable Integer id,
            @RequestBody CustomerDto dto) {
        CustomerDto updated = customerService.updateCustomer(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @Override
    public ResponseEntity<Void> deleteCustomer(@PathVariable Integer id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
    
    @Override
    public ResponseEntity<Boolean> emailExists(@PathVariable String email) {
        return ResponseEntity.ok(customerService.emailExists(email));
    }
    
    @Override
    public ResponseEntity<Boolean> loginExists(@PathVariable String login) {
        return ResponseEntity.ok(customerService.loginExists(login));
    }
}
