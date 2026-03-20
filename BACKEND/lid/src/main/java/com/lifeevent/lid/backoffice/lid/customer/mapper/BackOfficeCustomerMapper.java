package com.lifeevent.lid.backoffice.lid.customer.mapper;

import com.lifeevent.lid.backoffice.lid.customer.dto.BackOfficeCustomerDto;
import com.lifeevent.lid.user.customer.entity.Customer;
import org.springframework.stereotype.Component;

@Component
public class BackOfficeCustomerMapper {

    public BackOfficeCustomerDto toDto(Customer customer) {
        if (customer == null) return null;
        BackOfficeCustomerDto dto = new BackOfficeCustomerDto();
        dto.setId(customer.getUserId());
        dto.setPrenom(customer.getFirstName());
        dto.setNom(customer.getLastName());
        dto.setEmail(customer.getEmail());
        dto.setTelephone(customer.getPhoneNumber());
        dto.setVille(customer.getCity());
        dto.setPays(customer.getCountry());
        dto.setName(buildName(customer.getFirstName(), customer.getLastName()));
        return dto;
    }

    public Customer toEntity(BackOfficeCustomerDto dto, String userId) {
        if (dto == null) return null;
        return Customer.builder()
                .userId(userId)
                .firstName(dto.getPrenom())
                .lastName(dto.getNom())
                .email(dto.getEmail())
                .emailVerified(false)
                .phoneNumber(dto.getTelephone())
                .city(dto.getVille())
                .country(dto.getPays())
                .build();
    }

    private String buildName(String first, String last) {
        String a = first == null ? "" : first;
        String b = last == null ? "" : last;
        String full = (a + " " + b).trim();
        return full.isBlank() ? "-" : full;
    }
}
