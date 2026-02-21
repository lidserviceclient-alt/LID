package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;

public class ProductSummaryDto {
    private String id;
    private String sku;
    private String name;
    private String categoryId;
    private String category;
    private BigDecimal price;
    private Integer stock;
    private String status;
    private Boolean isFeatured;
    private Boolean isBestSeller;

    public ProductSummaryDto() {}

    public ProductSummaryDto(String id, String sku, String name, String categoryId, String category, BigDecimal price, Integer stock, String status, Boolean isFeatured, Boolean isBestSeller) {
        this.id = id;
        this.sku = sku;
        this.name = name;
        this.categoryId = categoryId;
        this.category = category;
        this.price = price;
        this.stock = stock;
        this.status = status;
        this.isFeatured = isFeatured;
        this.isBestSeller = isBestSeller;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsFeatured() {
        return isFeatured;
    }

    public void setIsFeatured(Boolean isFeatured) {
        this.isFeatured = isFeatured;
    }

    public Boolean getIsBestSeller() {
        return isBestSeller;
    }

    public void setIsBestSeller(Boolean isBestSeller) {
        this.isBestSeller = isBestSeller;
    }
}
