package com.lifeevent.lid.core.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkCreateProductsRequest(
        @NotEmpty
        List<@Valid CreateProductRequest> products
) {
}

