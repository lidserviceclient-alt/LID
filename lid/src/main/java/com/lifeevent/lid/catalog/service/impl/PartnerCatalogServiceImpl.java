package com.lifeevent.lid.catalog.service.impl;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.catalog.dto.PartnerCatalogPartnerCollectionDto;
import com.lifeevent.lid.catalog.dto.PartnerCatalogPartnerDetailsDto;
import com.lifeevent.lid.catalog.dto.PartnerCatalogPartnerDto;
import com.lifeevent.lid.catalog.dto.PartnerCatalogProductDto;
import com.lifeevent.lid.catalog.dto.PartnerCatalogProductsPageDto;
import com.lifeevent.lid.catalog.service.PartnerCatalogService;
import com.lifeevent.lid.common.cache.CatalogCacheNames;
import com.lifeevent.lid.common.exception.ResourceNotFoundException;
import com.lifeevent.lid.common.service.PublicAssetUrlResolver;
import com.lifeevent.lid.user.partner.entity.Partner;
import com.lifeevent.lid.user.partner.entity.PartnerRegistrationStatus;
import com.lifeevent.lid.user.partner.entity.Shop;
import com.lifeevent.lid.user.partner.repository.PartnerRepository;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.Locale;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PartnerCatalogServiceImpl implements PartnerCatalogService {
    private static final long AGGREGATION_TIMEOUT_SECONDS = 8L;

    private final PartnerRepository partnerRepository;
    private final ArticleRepository articleRepository;
    private final PublicAssetUrlResolver publicAssetUrlResolver;
    private final PlatformTransactionManager transactionManager;
    @Resource(name = "aggregatorExecutor")
    private Executor aggregatorExecutor;

    @Override
    public Page<PartnerCatalogPartnerDto> listPartners(int page, int size, String q) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by(Sort.Direction.DESC, "createdAt"));
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
    @Cacheable(
            cacheNames = CatalogCacheNames.PARTNER_COLLECTION,
            key = "@cacheScopeVersionService.partnerVersionToken(#partnerId) + ':public:' + #partnerId + ':p=' + #page + ':s=' + #size + ':sk=' + (#sortKey == null ? '' : #sortKey)",
            sync = true
    )
    public PartnerCatalogPartnerCollectionDto getPartnerCollection(String partnerId, int page, int size, String sortKey) {
        CompletableFuture<PartnerCatalogPartnerDetailsDto> detailsFuture =
                supplyAggregationAsync(() -> getPartnerDetails(partnerId));
        CompletableFuture<Page<PartnerCatalogProductDto>> productsFuture =
                supplyAggregationAsync(() -> listPartnerProducts(partnerId, page, size, sortKey));

        CompletableFuture.allOf(detailsFuture, productsFuture).join();

        PartnerCatalogPartnerDetailsDto details = detailsFuture.join();
        Page<PartnerCatalogProductDto> productsPage = productsFuture.join();
        return new PartnerCatalogPartnerCollectionDto(
                details.partner(),
                details.products(),
                new PartnerCatalogProductsPageDto(
                        productsPage.getContent(),
                        productsPage.getNumber(),
                        productsPage.getSize(),
                        productsPage.getTotalElements(),
                        productsPage.getTotalPages()
                )
        );
    }

    @Override
    public Page<PartnerCatalogProductDto> listPartnerProducts(String partnerId, int page, int size, String sortKey) {
        ensurePartnerExists(partnerId);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), resolveSort(sortKey));
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
                shop == null ? null : toPublicAssetUrl(shop.getLogoUrl()),
                shop == null ? null : toPublicAssetUrl(shop.getBackgroundUrl()),
                shop == null || shop.getMainCategory() == null ? null : shop.getMainCategory().getId(),
                shop == null || shop.getMainCategory() == null ? null : shop.getMainCategory().getName(),
                partner.getCity(),
                partner.getCountry()
        );
    }

    private PartnerCatalogProductDto toProductDto(Article article) {
        List<String> secondary = article.getSecondaryImageUrls() == null
                ? List.of()
                : article.getSecondaryImageUrls().stream()
                .map(this::toPublicAssetUrl)
                .filter(value -> value != null && !value.isBlank())
                .toList();
        return new PartnerCatalogProductDto(
                article.getId(),
                article.getName(),
                article.getSku(),
                article.getEan(),
                article.getPrice(),
                toPublicAssetUrl(article.getMainImageUrl()),
                secondary,
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

    private String toPublicAssetUrl(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return null;
        }
        String lower = normalized.toLowerCase(Locale.ROOT);
        if (lower.startsWith("http://") || lower.startsWith("https://") || normalized.startsWith("/")) {
            return normalized;
        }
        return publicAssetUrlResolver.toPublicUrl(normalized);
    }

    private SearchQuery buildSearchQuery(String q) {
        String normalized = normalize(q);
        boolean empty = normalized == null;
        String pattern = empty ? null : "%" + normalized.toLowerCase(Locale.ROOT) + "%";
        return new SearchQuery(pattern, empty);
    }

    private <T> CompletableFuture<T> supplyAggregationAsync(Supplier<T> supplier) {
        return CompletableFuture.supplyAsync(() -> {
                    TransactionTemplate tx = new TransactionTemplate(transactionManager);
                    tx.setReadOnly(true);
                    return tx.execute(status -> supplier.get());
                }, aggregatorExecutor)
                .orTimeout(AGGREGATION_TIMEOUT_SECONDS, TimeUnit.SECONDS);
    }

    private record SearchQuery(String pattern, boolean empty) {
    }
}
