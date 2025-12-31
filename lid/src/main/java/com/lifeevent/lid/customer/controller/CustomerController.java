package com.lifeevent.lid.customer.controller;

import com.lifeevent.lid.customer.dto.CustomerDto;
import com.lifeevent.lid.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
    
    private final CustomerService customerService;
    
    /**
     * Créer un client
     */
    @PostMapping
    public ResponseEntity<CustomerDto> createCustomer(@RequestBody CustomerDto dto) {
        CustomerDto created = customerService.createCustomer(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    /**
     * Récupérer un client par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<CustomerDto> getCustomer(@PathVariable Integer id) {
        Optional<CustomerDto> customer = customerService.getCustomerById(id);
        return customer.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Lister tous les clients
     */
    @GetMapping
    public ResponseEntity<List<CustomerDto>> getAllCustomers() {
        List<CustomerDto> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }
    
    /**
     * Recherche par email
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<CustomerDto> getCustomerByEmail(@PathVariable String email) {
        Optional<CustomerDto> customer = customerService.getCustomerByEmail(email);
        return customer.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Recherche par login
     */
    @GetMapping("/login/{login}")
    public ResponseEntity<CustomerDto> getCustomerByLogin(@PathVariable String login) {
        Optional<CustomerDto> customer = customerService.getCustomerByLogin(login);
        return customer.map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Mettre à jour un client
     */
    @PutMapping("/{id}")
    public ResponseEntity<CustomerDto> updateCustomer(
            @PathVariable Integer id,
            @RequestBody CustomerDto dto) {
        CustomerDto updated = customerService.updateCustomer(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Supprimer un client
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Integer id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Vérifier si un email existe
     */
    @GetMapping("/check-email/{email}")
    public ResponseEntity<Boolean> emailExists(@PathVariable String email) {
        return ResponseEntity.ok(customerService.emailExists(email));
    }
    
    /**
     * Vérifier si un login existe
     */
    @GetMapping("/check-login/{login}")
    public ResponseEntity<Boolean> loginExists(@PathVariable String login) {
        return ResponseEntity.ok(customerService.loginExists(login));
    }
}
