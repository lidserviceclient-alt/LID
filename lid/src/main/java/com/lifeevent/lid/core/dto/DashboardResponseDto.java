package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;

public class DashboardResponseDto {
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long pendingOrders;
    private long activeProducts;
    private long customers;
    private long lowStock;

    public DashboardResponseDto() {}

    public DashboardResponseDto(long totalOrders, BigDecimal totalRevenue, long pendingOrders, long activeProducts, long customers, long lowStock) {
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
        this.pendingOrders = pendingOrders;
        this.activeProducts = activeProducts;
        this.customers = customers;
        this.lowStock = lowStock;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public long getActiveProducts() {
        return activeProducts;
    }

    public void setActiveProducts(long activeProducts) {
        this.activeProducts = activeProducts;
    }

    public long getCustomers() {
        return customers;
    }

    public void setCustomers(long customers) {
        this.customers = customers;
    }

    public long getLowStock() {
        return lowStock;
    }

    public void setLowStock(long lowStock) {
        this.lowStock = lowStock;
    }
}
