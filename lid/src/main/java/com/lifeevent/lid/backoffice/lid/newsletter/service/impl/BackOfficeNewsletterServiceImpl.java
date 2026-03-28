package com.lifeevent.lid.backoffice.lid.newsletter.service.impl;

import com.lifeevent.lid.backoffice.lid.newsletter.dto.BackOfficeNewsletterStatsDto;
import com.lifeevent.lid.backoffice.lid.newsletter.dto.BackOfficeNewsletterCollectionDto;
import com.lifeevent.lid.backoffice.lid.newsletter.dto.BackOfficeNewsletterSubscriberDto;
import com.lifeevent.lid.backoffice.lid.newsletter.service.BackOfficeNewsletterService;
import com.lifeevent.lid.common.cache.CacheScopeVersionService;
import com.lifeevent.lid.common.cache.CatalogCacheNames;
import com.lifeevent.lid.common.dto.PageResponse;
import com.lifeevent.lid.newsletter.entity.NewsletterSubscriber;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberSource;
import com.lifeevent.lid.newsletter.enumeration.NewsletterSubscriberStatus;
import com.lifeevent.lid.newsletter.repository.NewsletterSubscriberRepository;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Service
@Transactional
@RequiredArgsConstructor
public class BackOfficeNewsletterServiceImpl implements BackOfficeNewsletterService {
    private static final long AGGREGATION_TIMEOUT_SECONDS = 8L;

    private final NewsletterSubscriberRepository newsletterSubscriberRepository;
    private final CacheScopeVersionService cacheScopeVersionService;
    private final PlatformTransactionManager transactionManager;
    @Resource(name = "aggregatorExecutor")
    private Executor aggregatorExecutor;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = CatalogCacheNames.BACKOFFICE_NEWSLETTER_COLLECTION,
            key = "@cacheScopeVersionService.marketingVersion() + ':' + (#status == null ? 'ALL' : #status.name()) + ':' + (#q == null ? '' : #q.trim().toLowerCase()) + ':' + #page + ':' + #size",
            sync = true
    )
    public BackOfficeNewsletterCollectionDto getCollection(NewsletterSubscriberStatus status, String q, int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(0, page), Math.max(size, 1), Sort.by(Sort.Direction.DESC, "createdAt"));
        return new BackOfficeNewsletterCollectionDto(
                getStats(),
                PageResponse.from(getSubscribers(status, q, pageable))
        );
    }

    @Override
    @Transactional(readOnly = true)
    public BackOfficeNewsletterStatsDto getStats() {
        CompletableFuture<Long> totalFuture = supplyAggregationAsync(newsletterSubscriberRepository::count);
        CompletableFuture<Long> subscribedFuture = supplyAggregationAsync(
                () -> newsletterSubscriberRepository.countByStatus(NewsletterSubscriberStatus.SUBSCRIBED)
        );
        CompletableFuture<Long> unsubscribedFuture = supplyAggregationAsync(
                () -> newsletterSubscriberRepository.countByStatus(NewsletterSubscriberStatus.UNSUBSCRIBED)
        );

        CompletableFuture.allOf(totalFuture, subscribedFuture, unsubscribedFuture).join();

        long total = totalFuture.join();
        long subscribed = subscribedFuture.join();
        long unsubscribed = unsubscribedFuture.join();

        return BackOfficeNewsletterStatsDto.builder()
                .total(total)
                .subscribed(subscribed)
                .unsubscribed(unsubscribed)
                .build();
    }

    private <T> CompletableFuture<T> supplyAggregationAsync(Supplier<T> supplier) {
        return CompletableFuture.supplyAsync(() -> {
                    TransactionTemplate tx = new TransactionTemplate(transactionManager);
                    tx.setReadOnly(true);
                    return tx.execute(status -> supplier.get());
                }, aggregatorExecutor)
                .orTimeout(AGGREGATION_TIMEOUT_SECONDS, TimeUnit.SECONDS);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BackOfficeNewsletterSubscriberDto> getSubscribers(NewsletterSubscriberStatus status, String q, Pageable pageable) {
        String query = normalizeQuery(q);
        return newsletterSubscriberRepository.search(status, query, pageable).map(this::toDto);
    }

    @Override
    public BackOfficeNewsletterSubscriberDto createSubscriber(String email) {
        String safeEmail = normalizeAndValidateEmail(email);

        NewsletterSubscriber subscriber = newsletterSubscriberRepository.findByEmailIgnoreCase(safeEmail)
                .orElseGet(NewsletterSubscriber::new);

        subscriber.setEmail(safeEmail);
        subscriber.setSource(NewsletterSubscriberSource.BACKOFFICE);
        subscriber.setStatus(NewsletterSubscriberStatus.SUBSCRIBED);
        subscriber.setUnsubscribedAt(null);

        NewsletterSubscriber saved = newsletterSubscriberRepository.save(subscriber);
        cacheScopeVersionService.bumpMarketing();
        return toDto(saved);
    }

    @Override
    public void deleteSubscriber(String id) {
        if (!newsletterSubscriberRepository.existsById(id)) {
            throw new IllegalArgumentException("Abonné introuvable");
        }
        newsletterSubscriberRepository.deleteById(id);
        cacheScopeVersionService.bumpMarketing();
    }

    @Override
    public BackOfficeNewsletterSubscriberDto unsubscribe(String id) {
        NewsletterSubscriber subscriber = newsletterSubscriberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Abonné introuvable"));

        subscriber.setStatus(NewsletterSubscriberStatus.UNSUBSCRIBED);
        if (subscriber.getUnsubscribedAt() == null) {
            subscriber.setUnsubscribedAt(LocalDateTime.now());
        }

        NewsletterSubscriber saved = newsletterSubscriberRepository.save(subscriber);
        cacheScopeVersionService.bumpMarketing();
        return toDto(saved);
    }

    private BackOfficeNewsletterSubscriberDto toDto(NewsletterSubscriber entity) {
        return BackOfficeNewsletterSubscriberDto.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .status(entity.getStatus())
                .source(entity.getSource())
                .dateCreation(entity.getCreatedAt())
                .dateMiseAJour(entity.getUpdatedAt())
                .dateDesabonnement(entity.getUnsubscribedAt())
                .build();
    }

    private String normalizeQuery(String q) {
        if (q == null) {
            return null;
        }
        String trimmed = q.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeAndValidateEmail(String email) {
        String safe = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (safe.isBlank()) {
            throw new IllegalArgumentException("Email requis");
        }
        if (!safe.contains("@") || safe.startsWith("@") || safe.endsWith("@")) {
            throw new IllegalArgumentException("Email invalide");
        }
        return safe;
    }
}
