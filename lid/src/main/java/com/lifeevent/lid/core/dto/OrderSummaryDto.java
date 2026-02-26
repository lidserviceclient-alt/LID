package com.lifeevent.lid.core.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderSummaryDto {
    private String id;
    private String customer;
    private int items;
    private BigDecimal total;
    private String status;
    private String shipmentStatus;
    private String courierReference;
    private String courierName;
    private String courierPhone;
    private String courierUser;
    private LocalDateTime courierScannedAt;
    private LocalDateTime dateCreation;

    public OrderSummaryDto() {}

    public OrderSummaryDto(
            String id,
            String customer,
            int items,
            BigDecimal total,
            String status,
            String shipmentStatus,
            String courierReference,
            String courierName,
            String courierPhone,
            String courierUser,
            LocalDateTime courierScannedAt,
            LocalDateTime dateCreation
    ) {
        this.id = id;
        this.customer = customer;
        this.items = items;
        this.total = total;
        this.status = status;
        this.shipmentStatus = shipmentStatus;
        this.courierReference = courierReference;
        this.courierName = courierName;
        this.courierPhone = courierPhone;
        this.courierUser = courierUser;
        this.courierScannedAt = courierScannedAt;
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

    public String getShipmentStatus() {
        return shipmentStatus;
    }

    public void setShipmentStatus(String shipmentStatus) {
        this.shipmentStatus = shipmentStatus;
    }

    public String getCourierReference() {
        return courierReference;
    }

    public void setCourierReference(String courierReference) {
        this.courierReference = courierReference;
    }

    public String getCourierName() {
        return courierName;
    }

    public void setCourierName(String courierName) {
        this.courierName = courierName;
    }

    public String getCourierPhone() {
        return courierPhone;
    }

    public void setCourierPhone(String courierPhone) {
        this.courierPhone = courierPhone;
    }

    public String getCourierUser() {
        return courierUser;
    }

    public void setCourierUser(String courierUser) {
        this.courierUser = courierUser;
    }

    public LocalDateTime getCourierScannedAt() {
        return courierScannedAt;
    }

    public void setCourierScannedAt(LocalDateTime courierScannedAt) {
        this.courierScannedAt = courierScannedAt;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
}
