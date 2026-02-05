package com.lifeevent.lid.core.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBackofficeOrderRequest {

    @NotBlank
    private String customerId;

    private String promoCode;

    @Valid
    @NotEmpty
    private List<CreateOrderLineRequest> lines;
}
