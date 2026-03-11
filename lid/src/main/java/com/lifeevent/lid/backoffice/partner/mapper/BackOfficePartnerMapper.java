package com.lifeevent.lid.backoffice.partner.mapper;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCustomerDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerOrderDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerProductDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerSettingsDto;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.entity.Shop;
import org.springframework.stereotype.Component;

@Component
public class BackOfficePartnerMapper {

    public BackOfficePartnerProductDto toProductDto(Article article, int stock) {
        return new BackOfficePartnerProductDto(
                article.getId(),
                article.getName(),
                article.getSku(),
                article.getEan(),
                article.getPrice(),
                stock,
                article.getStatus(),
                article.getIsFeatured(),
                article.getIsBestSeller(),
                article.getCreatedAt()
        );
    }

    public BackOfficePartnerOrderDto toOrderDto(Order order) {
        Customer customer = order.getCustomer();
        String fullName = customer == null ? null : formatFullName(customer.getFirstName(), customer.getLastName());
        return new BackOfficePartnerOrderDto(
                order.getId(),
                order.getTrackingNumber(),
                order.getCurrentStatus(),
                order.getAmount(),
                order.getCurrency(),
                customer == null ? null : customer.getUserId(),
                fullName,
                customer == null ? null : customer.getEmail(),
                order.getCreatedAt()
        );
    }

    public BackOfficePartnerCustomerDto toCustomerDto(Customer customer, OrderRepository.CustomerOrderMetricsView metrics) {
        return new BackOfficePartnerCustomerDto(
                customer.getUserId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getEmail(),
                customer.getPhoneNumber(),
                metrics == null || metrics.getOrders() == null ? 0L : metrics.getOrders(),
                metrics == null || metrics.getSpent() == null ? 0D : metrics.getSpent(),
                metrics == null ? null : metrics.getLastOrder()
        );
    }

    public BackOfficePartnerSettingsDto toSettingsDto(Partner partner) {
        Shop shop = partner.getShop();
        return new BackOfficePartnerSettingsDto(
                partner.getUserId(),
                partner.getFirstName(),
                partner.getLastName(),
                partner.getEmail(),
                partner.getPhoneNumber(),
                shop == null ? null : shop.getShopId(),
                shop == null ? null : shop.getShopName(),
                shop == null ? null : shop.getShopDescription(),
                shop == null ? null : shop.getDescription(),
                shop == null ? null : shop.getLogoUrl(),
                shop == null ? null : shop.getBackgroundUrl(),
                shop == null ? null : shop.getStatus(),
                shop == null || shop.getMainCategory() == null ? null : shop.getMainCategory().getId(),
                partner.getBankName(),
                partner.getAccountHolder(),
                partner.getRib(),
                partner.getIban(),
                partner.getSwift(),
                partner.getHeadOfficeAddress(),
                partner.getCity(),
                partner.getCountry(),
                partner.getContractAccepted(),
                partner.getBusinessRegistrationDocumentUrl(),
                partner.getIdDocumentUrl(),
                partner.getNineaDocumentUrl(),
                partner.getRegistrationStatus()
        );
    }

    private String formatFullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String full = (first + " " + last).trim();
        return full.isEmpty() ? null : full;
    }
}
