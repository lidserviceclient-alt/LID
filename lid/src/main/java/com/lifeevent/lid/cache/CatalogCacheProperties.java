package com.lifeevent.lid.cache;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "config.cache.catalog")
public class CatalogCacheProperties {

    private long collectionTtlMinutes = 30;
    private long categoriesTtlMinutes = 1440;
    private long featuredCategoriesTtlMinutes = 720;
    private long featuredProductsTtlMinutes = 180;
    private long bestsellerProductsTtlMinutes = 180;
    private long latestProductsTtlMinutes = 30;
    private long productDetailsTtlMinutes = 240;
    private long productReviewsTtlMinutes = 60;
    private long blogPostsTtlMinutes = 120;
    private long blogPostDetailsTtlMinutes = 240;
    private long ticketsTtlMinutes = 120;
    private long ticketDetailsTtlMinutes = 240;
    private long partnerCollectionTtlMinutes = 30;
    private long partnerSettingsTtlMinutes = 240;
    private long partnerProductsPageTtlMinutes = 30;
    private long partnerProductDetailsTtlMinutes = 60;
    private long partnerOrdersPageTtlMinutes = 10;
    private long partnerOrderDetailsTtlMinutes = 10;
    private long partnerCustomersPageTtlMinutes = 30;
    private long partnerCategoriesTtlMinutes = 240;
    private long partnerPreferencesTtlMinutes = 240;

    private long collectionMaxSize = 1_000;
    private long categoriesMaxSize = 500;
    private long featuredCategoriesMaxSize = 500;
    private long featuredProductsMaxSize = 1_000;
    private long bestsellerProductsMaxSize = 1_000;
    private long latestProductsMaxSize = 1_000;
    private long productDetailsMaxSize = 10_000;
    private long productReviewsMaxSize = 10_000;
    private long blogPostsMaxSize = 1_000;
    private long blogPostDetailsMaxSize = 2_000;
    private long ticketsMaxSize = 1_000;
    private long ticketDetailsMaxSize = 2_000;
    private long partnerCollectionMaxSize = 1_000;
    private long partnerSettingsMaxSize = 1_000;
    private long partnerProductsPageMaxSize = 2_000;
    private long partnerProductDetailsMaxSize = 5_000;
    private long partnerOrdersPageMaxSize = 2_000;
    private long partnerOrderDetailsMaxSize = 5_000;
    private long partnerCustomersPageMaxSize = 2_000;
    private long partnerCategoriesMaxSize = 2_000;
    private long partnerPreferencesMaxSize = 1_000;
}
