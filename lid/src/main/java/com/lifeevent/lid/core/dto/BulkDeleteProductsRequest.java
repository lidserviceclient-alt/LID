package com.lifeevent.lid.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkDeleteProductsRequest(
        @NotEmpty
        List<@NotBlank String> ids
) {
}
