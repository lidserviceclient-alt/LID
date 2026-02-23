package com.lifeevent.lid.core.controller;

import com.lifeevent.lid.core.dto.BulkCreateProductResultDto;
import com.lifeevent.lid.core.dto.BulkCreateProductsRequest;
import com.lifeevent.lid.core.dto.BulkCreateProductsResponse;
import com.lifeevent.lid.core.dto.BulkDeleteProductsRequest;
import com.lifeevent.lid.core.dto.BulkDeleteProductsResponse;
import com.lifeevent.lid.core.dto.CreateProductRequest;
import com.lifeevent.lid.core.dto.ProductSummaryDto;
import com.lifeevent.lid.core.dto.UpdateProductRequest;
import com.lifeevent.lid.core.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/backoffice/products")
public class ProductsController {

    private final ProductService productService;

    public ProductsController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public Page<ProductSummaryDto> listProducts(
        @RequestParam(value = "page", defaultValue = "0") int page,
        @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return productService.listProducts(pageable);
    }

    @PostMapping
    public ProductSummaryDto createProduct(@Valid @RequestBody CreateProductRequest request) {
        return productService.createProduct(request);
    }

    @PostMapping("/bulk")
    public BulkCreateProductsResponse bulkCreate(@Valid @RequestBody BulkCreateProductsRequest request) {
        List<CreateProductRequest> products = request.products();
        List<BulkCreateProductResultDto> results = new ArrayList<>();
        int created = 0;
        for (int i = 0; i < products.size(); i++) {
            CreateProductRequest item = products.get(i);
            try {
                ProductSummaryDto dto = productService.createProduct(item);
                created++;
                results.add(new BulkCreateProductResultDto(
                        i,
                        item.getReferenceProduitPartenaire(),
                        item.getName(),
                        true,
                        dto.getId(),
                        null
                ));
            } catch (Exception ex) {
                String msg = ex.getMessage() != null ? ex.getMessage() : "Erreur inconnue";
                results.add(new BulkCreateProductResultDto(
                        i,
                        item.getReferenceProduitPartenaire(),
                        item.getName(),
                        false,
                        null,
                        msg
                ));
            }
        }
        return new BulkCreateProductsResponse(products.size(), created, results);
    }

    @PostMapping("/bulk-delete")
    public BulkDeleteProductsResponse bulkDelete(@Valid @RequestBody BulkDeleteProductsRequest request) {
        return productService.deleteProductsBulk(request.ids());
    }

    @GetMapping("/{id}")
    public ProductSummaryDto getProduct(@PathVariable String id) {
        // Retourne un summary pour simplicité; peut être étendu si besoin
        return productService.getProduct(id);
    }

    @PutMapping("/{id}")
    public ProductSummaryDto updateProduct(@PathVariable String id,
                                           @Valid @RequestBody UpdateProductRequest request) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
    }
}
