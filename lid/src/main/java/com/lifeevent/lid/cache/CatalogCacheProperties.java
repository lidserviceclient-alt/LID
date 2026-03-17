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
}

