package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CustomerSummaryDto {
    private String id;
    private String name;
    private String email;
    private String role;
    private long orders;
    private BigDecimal spent;
    private LocalDateTime lastOrder;
    private Integer loyaltyPoints;
    private String loyaltyTier;

    public CustomerSummaryDto() {}

    public CustomerSummaryDto(String id, String name, String email, String role, long orders, BigDecimal spent, LocalDateTime lastOrder, Integer loyaltyPoints, String loyaltyTier) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.orders = orders;
        this.spent = spent;
        this.lastOrder = lastOrder;
        this.loyaltyPoints = loyaltyPoints;
        this.loyaltyTier = loyaltyTier;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public long getOrders() {
        return orders;
    }

    public void setOrders(long orders) {
        this.orders = orders;
    }

    public BigDecimal getSpent() {
        return spent;
    }

    public void setSpent(BigDecimal spent) {
        this.spent = spent;
    }

    public LocalDateTime getLastOrder() {
        return lastOrder;
    }

    public void setLastOrder(LocalDateTime lastOrder) {
        this.lastOrder = lastOrder;
    }

    public Integer getLoyaltyPoints() {
        return loyaltyPoints;
    }

    public void setLoyaltyPoints(Integer loyaltyPoints) {
        this.loyaltyPoints = loyaltyPoints;
    }

    public String getLoyaltyTier() {
        return loyaltyTier;
    }

    public void setLoyaltyTier(String loyaltyTier) {
        this.loyaltyTier = loyaltyTier;
    }
}
