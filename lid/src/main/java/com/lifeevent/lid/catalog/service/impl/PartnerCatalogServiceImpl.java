package com.lifeevent.lid.catalog.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.catalog.dto.PartnerCatalogPartnerDetailsDto;
import com.lifeevent.lid.catalog.dto.PartnerCatalogPartnerDto;
import com.lifeevent.lid.catalog.dto.PartnerCatalogProductDto;
import com.lifeevent.lid.catalog.service.PartnerCatalogService;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;
import com.lifeevent.lid.user.partner.entity.Shop;
import com.lifeevent.lid.user.partner.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PartnerCatalogServiceImpl implements PartnerCatalogService {

    private final PartnerRepository partnerRepository;
    private final ArticleRepository articleRepository;

    @Override
    public Page<PartnerCatalogPartnerDto> listPartners(int page, int size, String q) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50), Sort.by(Sort.Direction.DESC, "createdAt"));
        SearchQuery query = buildSearchQuery(q);
        return partnerRepository.searchVerifiedForCatalog(
                        PartnerRegistrationStatus.VERIFIED,
                        query.pattern(),
                        query.empty(),
                        pageable
                )
                .map(this::toPartnerDto);
    }

    @Override
    public PartnerCatalogPartnerDetailsDto getPartnerDetails(String partnerId) {
        Partner partner = partnerRepository.findVerifiedByUserIdWithShop(partnerId, PartnerRegistrationStatus.VERIFIED)
                .orElseThrow(() -> new ResourceNotFoundException("Partner", "partnerId", partnerId));
        long products = articleRepository.countByReferencePartner(partnerId);
        return new PartnerCatalogPartnerDetailsDto(toPartnerDto(partner), products);
    }

    @Override
    public Page<PartnerCatalogProductDto> listPartnerProducts(String partnerId, int page, int size, String sortKey) {
        ensurePartnerExists(partnerId);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), resolveSort(sortKey));
        return articleRepository.findByReferencePartnerAndStatus(partnerId, ArticleStatus.ACTIVE, pageable)
                .map(this::toProductDto);
    }

    private void ensurePartnerExists(String partnerId) {
        partnerRepository.findVerifiedByUserIdWithShop(partnerId, PartnerRegistrationStatus.VERIFIED)
                .orElseThrow(() -> new ResourceNotFoundException("Partner", "partnerId", partnerId));
    }

    private PartnerCatalogPartnerDto toPartnerDto(Partner partner) {
        Shop shop = partner.getShop();
        return new PartnerCatalogPartnerDto(
                partner.getUserId(),
                partner.getFirstName(),
                partner.getLastName(),
                partner.getEmail(),
                partner.getPhoneNumber(),
                shop == null ? null : shop.getShopId(),
                shop == null ? null : shop.getShopName(),
                shop == null ? null : shop.getShopDescription(),
                shop == null ? null : shop.getLogoUrl(),
                shop == null ? null : shop.getBackgroundUrl(),
                shop == null || shop.getMainCategory() == null ? null : shop.getMainCategory().getId(),
                shop == null || shop.getMainCategory() == null ? null : shop.getMainCategory().getName(),
                partner.getCity(),
                partner.getCountry()
        );
    }

    private PartnerCatalogProductDto toProductDto(Article article) {
        return new PartnerCatalogProductDto(
                article.getId(),
                article.getName(),
                article.getSku(),
                article.getEan(),
                article.getPrice(),
                article.getImg(),
                article.getBrand(),
                article.getCreatedAt()
        );
    }

    private Sort resolveSort(String sortKey) {
        String key = sortKey == null ? "" : sortKey.trim().toLowerCase(Locale.ROOT);
        if ("price-asc".equals(key)) {
            return Sort.by(Sort.Direction.ASC, "price");
        }
        if ("price-desc".equals(key)) {
            return Sort.by(Sort.Direction.DESC, "price");
        }
        return Sort.by(Sort.Direction.DESC, "createdAt");
    }

    private String normalize(String q) {
        if (q == null) {
            return null;
        }
        String trimmed = q.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private SearchQuery buildSearchQuery(String q) {
        String normalized = normalize(q);
        boolean empty = normalized == null;
        String pattern = empty ? null : "%" + normalized.toLowerCase(Locale.ROOT) + "%";
        return new SearchQuery(pattern, empty);
    }

    private record SearchQuery(String pattern, boolean empty) {
    }
}
