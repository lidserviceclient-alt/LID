package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderSummaryDto {
    private String id;
    private String customer;
    private int items;
    private BigDecimal total;
    private String status;
    private LocalDateTime dateCreation;

    public OrderSummaryDto() {}

    public OrderSummaryDto(String id, String customer, int items, BigDecimal total, String status, LocalDateTime dateCreation) {
        this.id = id;
        this.customer = customer;
        this.items = items;
        this.total = total;
        this.status = status;
        this.dateCreation = dateCreation;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCustomer() {
        return customer;
    }

    public void setCustomer(String customer) {
        this.customer = customer;
    }

    public int getItems() {
        return items;
    }

    public void setItems(int items) {
        this.items = items;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
}
