package com.lifeevent.lid.backoffice.product.controller;

import com.lifeevent.lid.backoffice.product.dto.BackOfficeProductDto;
import com.lifeevent.lid.backoffice.product.dto.BulkProductCreateRequest;
import com.lifeevent.lid.backoffice.product.dto.BulkProductDeleteRequest;
import com.lifeevent.lid.backoffice.product.dto.BulkProductDeleteResponse;
import com.lifeevent.lid.backoffice.product.dto.BulkProductResult;
import com.lifeevent.lid.backoffice.product.service.BackOfficeProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/backoffice/products", "/api/backoffice/products"})
@RequiredArgsConstructor
public class BackOfficeProductController implements IBackOfficeProductController {

    private final BackOfficeProductService backOfficeProductService;

    @Override
    public ResponseEntity<Page<BackOfficeProductDto>> getAll(int page, int size) {
        return ResponseEntity.ok(backOfficeProductService.getAll(PageRequest.of(page, size)));
    }

    @Override
    public ResponseEntity<BackOfficeProductDto> create(BackOfficeProductDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(backOfficeProductService.create(dto));
    }

    @Override
    public ResponseEntity<BackOfficeProductDto> getById(Long id) {
        return ResponseEntity.ok(backOfficeProductService.getById(id));
    }

    @Override
    public ResponseEntity<BackOfficeProductDto> update(Long id, BackOfficeProductDto dto) {
        return ResponseEntity.ok(backOfficeProductService.update(id, dto));
    }

    @Override
    public ResponseEntity<Void> delete(Long id) {
        backOfficeProductService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<BulkProductResult> bulkCreate(BulkProductCreateRequest request) {
        List<BackOfficeProductDto> products = request != null ? request.getProducts() : List.of();
        return ResponseEntity.ok(backOfficeProductService.bulkCreate(products));
    }

    @Override
    public ResponseEntity<BulkProductDeleteResponse> bulkDelete(BulkProductDeleteRequest request) {
        List<Long> ids = request != null ? request.getIds() : List.of();
        return ResponseEntity.ok(backOfficeProductService.bulkDelete(ids));
    }
}
