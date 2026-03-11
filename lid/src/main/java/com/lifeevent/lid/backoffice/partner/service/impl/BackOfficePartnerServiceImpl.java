package com.lifeevent.lid.backoffice.partner.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCollectionDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerCustomerDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerOrderDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerProductDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerSettingsDto;
import com.lifeevent.lid.backoffice.partner.dto.BackOfficePartnerStatsDto;
import com.lifeevent.lid.backoffice.partner.mapper.BackOfficePartnerMapper;
import com.lifeevent.lid.backoffice.partner.service.BackOfficePartnerService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.security.SecurityUtils;
import com.lifeevent.lid.order.entity.Order;
import com.lifeevent.lid.order.repository.OrderRepository;
import com.lifeevent.lid.stock.repository.StockRepository;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BackOfficePartnerServiceImpl implements BackOfficePartnerService {

    private final PartnerRepository partnerRepository;
    private final ArticleRepository articleRepository;
    private final OrderRepository orderRepository;
    private final StockRepository stockRepository;
    private final BackOfficePartnerMapper mapper;

    @Override
    public BackOfficePartnerCollectionDto getMyCollection(int productLimit, int orderLimit, int customerLimit) {
        String partnerId = requireCurrentPartnerId();
        BackOfficePartnerStatsDto stats = buildStats(partnerId);
        List<BackOfficePartnerProductDto> products = getProductsSlice(partnerId, safeLimit(productLimit, 8));
        List<BackOfficePartnerOrderDto> orders = getOrdersSlice(partnerId, safeLimit(orderLimit, 8));
        List<BackOfficePartnerCustomerDto> customers = getCustomersSlice(partnerId, safeLimit(customerLimit, 8));
        BackOfficePartnerSettingsDto settings = getMySettings();
        return new BackOfficePartnerCollectionDto(stats, products, orders, customers, settings);
    }

    @Override
    public Page<BackOfficePartnerProductDto> getMyProducts(int page, int size) {
        String partnerId = requireCurrentPartnerId();
        Pageable pageable = PageRequest.of(safePage(page), safePageSize(size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Article> products = articleRepository.findByReferencePartner(partnerId, pageable);
        Map<Long, Integer> stockById = loadStockByArticleIds(products.getContent().stream().map(Article::getId).toList());
        List<BackOfficePartnerProductDto> content = products.getContent().stream()
                .map(article -> mapper.toProductDto(article, stockById.getOrDefault(article.getId(), 0)))
                .toList();
        return new PageImpl<>(content, pageable, products.getTotalElements());
    }

    @Override
    public Page<BackOfficePartnerOrderDto> getMyOrders(int page, int size) {
        String partnerId = requireCurrentPartnerId();
        Pageable pageable = PageRequest.of(safePage(page), safePageSize(size), Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderRepository.findByPartnerId(partnerId, pageable).map(mapper::toOrderDto);
    }

    @Override
    public Page<BackOfficePartnerCustomerDto> getMyCustomers(int page, int size) {
        String partnerId = requireCurrentPartnerId();
        Pageable pageable = PageRequest.of(safePage(page), safePageSize(size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Customer> customerPage = orderRepository.findCustomersByPartnerId(partnerId, pageable);
        Map<String, OrderRepository.CustomerOrderMetricsView> metricsByCustomer = loadMetricsByCustomerIds(customerPage.getContent());
        List<BackOfficePartnerCustomerDto> content = customerPage.getContent().stream()
                .map(customer -> mapper.toCustomerDto(customer, metricsByCustomer.get(customer.getUserId())))
                .toList();
        return new PageImpl<>(content, pageable, customerPage.getTotalElements());
    }

    @Override
    public BackOfficePartnerSettingsDto getMySettings() {
        Partner partner = requirePartner(requireCurrentPartnerId());
        return mapper.toSettingsDto(partner);
    }

    @Override
    @Transactional
    public BackOfficePartnerSettingsDto updateMySettings(BackOfficePartnerSettingsDto dto) {
        String partnerId = requireCurrentPartnerId();
        Partner partner = requirePartner(partnerId);

        partner.setFirstName(normalizeOrCurrent(dto.firstName(), partner.getFirstName()));
        partner.setLastName(normalizeOrCurrent(dto.lastName(), partner.getLastName()));
        partner.setPhoneNumber(normalizeOrCurrent(dto.phoneNumber(), partner.getPhoneNumber()));
        partner.setBankName(normalizeOrCurrent(dto.bankName(), partner.getBankName()));
        partner.setAccountHolder(normalizeOrCurrent(dto.accountHolder(), partner.getAccountHolder()));
        partner.setRib(normalizeOrCurrent(dto.rib(), partner.getRib()));
        partner.setIban(normalizeOrCurrent(dto.iban(), partner.getIban()));
        partner.setSwift(normalizeOrCurrent(dto.swift(), partner.getSwift()));
        partner.setHeadOfficeAddress(normalizeOrCurrent(dto.headOfficeAddress(), partner.getHeadOfficeAddress()));
        partner.setCity(normalizeOrCurrent(dto.city(), partner.getCity()));
        partner.setCountry(normalizeOrCurrent(dto.country(), partner.getCountry()));

        if (partner.getShop() != null) {
            partner.getShop().setShopName(normalizeOrCurrent(dto.shopName(), partner.getShop().getShopName()));
            partner.getShop().setShopDescription(normalizeOrCurrent(dto.shopDescription(), partner.getShop().getShopDescription()));
            partner.getShop().setDescription(normalizeOrCurrent(dto.description(), partner.getShop().getDescription()));
            partner.getShop().setLogoUrl(normalizeOrCurrent(dto.logoUrl(), partner.getShop().getLogoUrl()));
            partner.getShop().setBackgroundUrl(normalizeOrCurrent(dto.backgroundUrl(), partner.getShop().getBackgroundUrl()));
        }

        return mapper.toSettingsDto(partnerRepository.save(partner));
    }

    private BackOfficePartnerStatsDto buildStats(String partnerId) {
        long products = articleRepository.countByReferencePartner(partnerId);
        OrderRepository.PartnerOrderMetricsView orderMetrics = orderRepository.aggregateMetricsByPartnerId(partnerId);
        long orders = orderMetrics == null || orderMetrics.getOrders() == null ? 0L : orderMetrics.getOrders();
        double revenue = orderMetrics == null || orderMetrics.getRevenue() == null ? 0D : orderMetrics.getRevenue();
        long customers = orderRepository.countDistinctCustomersByPartnerId(partnerId);
        return new BackOfficePartnerStatsDto(products, orders, customers, revenue);
    }

    private List<BackOfficePartnerProductDto> getProductsSlice(String partnerId, int limit) {
        Page<Article> page = articleRepository.findByReferencePartner(partnerId, PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt")));
        Map<Long, Integer> stockById = loadStockByArticleIds(page.getContent().stream().map(Article::getId).toList());
        return page.getContent().stream()
                .map(article -> mapper.toProductDto(article, stockById.getOrDefault(article.getId(), 0)))
                .toList();
    }

    private List<BackOfficePartnerOrderDto> getOrdersSlice(String partnerId, int limit) {
        return orderRepository.findByPartnerId(partnerId, PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent()
                .stream()
                .map(mapper::toOrderDto)
                .toList();
    }

    private List<BackOfficePartnerCustomerDto> getCustomersSlice(String partnerId, int limit) {
        Page<Customer> page = orderRepository.findCustomersByPartnerId(partnerId, PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt")));
        Map<String, OrderRepository.CustomerOrderMetricsView> metricsByCustomer = loadMetricsByCustomerIds(page.getContent());
        return page.getContent().stream()
                .map(customer -> mapper.toCustomerDto(customer, metricsByCustomer.get(customer.getUserId())))
                .toList();
    }

    private Map<Long, Integer> loadStockByArticleIds(List<Long> articleIds) {
        if (articleIds == null || articleIds.isEmpty()) {
            return Map.of();
        }
        return stockRepository.sumAvailableByArticleIds(articleIds).stream()
                .collect(Collectors.toMap(
                        StockRepository.ArticleStockTotalView::getArticleId,
                        row -> row.getStock() == null ? 0 : row.getStock(),
                        (left, right) -> left
                ));
    }

    private Map<String, OrderRepository.CustomerOrderMetricsView> loadMetricsByCustomerIds(Collection<Customer> customers) {
        if (customers == null || customers.isEmpty()) {
            return Map.of();
        }
        List<String> ids = customers.stream().map(Customer::getUserId).distinct().toList();
        return orderRepository.aggregateMetricsByCustomerIds(ids).stream()
                .collect(Collectors.toMap(OrderRepository.CustomerOrderMetricsView::getCustomerId, row -> row));
    }

    private Partner requirePartner(String partnerId) {
        return partnerRepository.findByUserIdWithShop(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner non trouvé", "partnerId", partnerId));
    }

    private String requireCurrentPartnerId() {
        String userId = SecurityUtils.getCurrentUserId();
        if (userId == null || userId.isBlank() || "anonymousUser".equalsIgnoreCase(userId)) {
            throw new ResponseStatusException(UNAUTHORIZED);
        }
        return userId;
    }

    private int safePage(int page) {
        return Math.max(0, page);
    }

    private int safePageSize(int size) {
        return Math.min(Math.max(size, 1), 100);
    }

    private int safeLimit(int limit, int fallback) {
        return Math.min(Math.max(limit, 1), 50);
    }

    private String normalizeOrCurrent(String value, String current) {
        if (value == null) {
            return current;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? current : trimmed;
    }
}
