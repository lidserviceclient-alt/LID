package com.lifeevent.lid.common.cache;

import java.util.List;

final class CacheConfigurationSupport {

    private CacheConfigurationSupport() {
    }

    static List<CacheSpec> cacheSpecs(CatalogCacheProperties properties) {
        return List.of(
                new CacheSpec(CatalogCacheNames.COLLECTION, properties.getCollectionTtlMinutes(), properties.getCollectionMaxSize()),
                new CacheSpec(CatalogCacheNames.CATEGORIES, properties.getCategoriesTtlMinutes(), properties.getCategoriesMaxSize()),
                new CacheSpec(CatalogCacheNames.FEATURED_CATEGORIES, properties.getFeaturedCategoriesTtlMinutes(), properties.getFeaturedCategoriesMaxSize()),
                new CacheSpec(CatalogCacheNames.FEATURED_PRODUCTS, properties.getFeaturedProductsTtlMinutes(), properties.getFeaturedProductsMaxSize()),
                new CacheSpec(CatalogCacheNames.BESTSELLER_PRODUCTS, properties.getBestsellerProductsTtlMinutes(), properties.getBestsellerProductsMaxSize()),
                new CacheSpec(CatalogCacheNames.LATEST_PRODUCTS, properties.getLatestProductsTtlMinutes(), properties.getLatestProductsMaxSize()),
                new CacheSpec(CatalogCacheNames.PRODUCT_DETAILS, properties.getProductDetailsTtlMinutes(), properties.getProductDetailsMaxSize()),
                new CacheSpec(CatalogCacheNames.PRODUCT_REVIEWS, properties.getProductReviewsTtlMinutes(), properties.getProductReviewsMaxSize()),
                new CacheSpec(CatalogCacheNames.BLOG_POSTS, properties.getBlogPostsTtlMinutes(), properties.getBlogPostsMaxSize()),
                new CacheSpec(CatalogCacheNames.BLOG_POST_DETAILS, properties.getBlogPostDetailsTtlMinutes(), properties.getBlogPostDetailsMaxSize()),
                new CacheSpec(CatalogCacheNames.TICKETS, properties.getTicketsTtlMinutes(), properties.getTicketsMaxSize()),
                new CacheSpec(CatalogCacheNames.TICKET_DETAILS, properties.getTicketDetailsTtlMinutes(), properties.getTicketDetailsMaxSize()),
                new CacheSpec(CatalogCacheNames.PARTNER_COLLECTION, properties.getPartnerCollectionTtlMinutes(), properties.getPartnerCollectionMaxSize()),
                new CacheSpec(CatalogCacheNames.PARTNER_SETTINGS, properties.getPartnerSettingsTtlMinutes(), properties.getPartnerSettingsMaxSize()),
                new CacheSpec(CatalogCacheNames.PARTNER_PRODUCTS_PAGE, properties.getPartnerProductsPageTtlMinutes(), properties.getPartnerProductsPageMaxSize()),
                new CacheSpec(CatalogCacheNames.PARTNER_PRODUCT_DETAILS, properties.getPartnerProductDetailsTtlMinutes(), properties.getPartnerProductDetailsMaxSize()),
                new CacheSpec(CatalogCacheNames.PARTNER_ORDERS_PAGE, properties.getPartnerOrdersPageTtlMinutes(), properties.getPartnerOrdersPageMaxSize()),
                new CacheSpec(CatalogCacheNames.PARTNER_ORDER_DETAILS, properties.getPartnerOrderDetailsTtlMinutes(), properties.getPartnerOrderDetailsMaxSize()),
                new CacheSpec(CatalogCacheNames.PARTNER_CUSTOMERS_PAGE, properties.getPartnerCustomersPageTtlMinutes(), properties.getPartnerCustomersPageMaxSize()),
                new CacheSpec(CatalogCacheNames.PARTNER_CATEGORIES, properties.getPartnerCategoriesTtlMinutes(), properties.getPartnerCategoriesMaxSize()),
                new CacheSpec(CatalogCacheNames.PARTNER_PREFERENCES, properties.getPartnerPreferencesTtlMinutes(), properties.getPartnerPreferencesMaxSize()),
                new CacheSpec(CatalogCacheNames.BACKOFFICE_OVERVIEW_DASHBOARD, properties.getBackofficeOverviewDashboardTtlMinutes(), properties.getBackofficeOverviewDashboardMaxSize()),
                new CacheSpec(CatalogCacheNames.BACKOFFICE_OVERVIEW_COLLECTION, properties.getBackofficeOverviewCollectionTtlMinutes(), properties.getBackofficeOverviewCollectionMaxSize()),
                new CacheSpec(CatalogCacheNames.BACKOFFICE_ANALYTICS_COLLECTION, properties.getBackofficeAnalyticsCollectionTtlMinutes(), properties.getBackofficeAnalyticsCollectionMaxSize()),
                new CacheSpec(CatalogCacheNames.BACKOFFICE_FINANCE_OVERVIEW, properties.getBackofficeFinanceOverviewTtlMinutes(), properties.getBackofficeFinanceOverviewMaxSize()),
                new CacheSpec(CatalogCacheNames.BACKOFFICE_FINANCE_TRANSACTIONS, properties.getBackofficeFinanceTransactionsTtlMinutes(), properties.getBackofficeFinanceTransactionsMaxSize()),
                new CacheSpec(CatalogCacheNames.BACKOFFICE_MARKETING_OVERVIEW, properties.getBackofficeMarketingOverviewTtlMinutes(), properties.getBackofficeMarketingOverviewMaxSize()),
                new CacheSpec(CatalogCacheNames.BACKOFFICE_NEWSLETTER_COLLECTION, properties.getBackofficeNewsletterCollectionTtlMinutes(), properties.getBackofficeNewsletterCollectionMaxSize()),
                new CacheSpec(CatalogCacheNames.BACKOFFICE_PRODUCTS_COLLECTION, properties.getBackofficeProductsCollectionTtlMinutes(), properties.getBackofficeProductsCollectionMaxSize()),
                new CacheSpec(CatalogCacheNames.BACKOFFICE_INVENTORY_COLLECTION, properties.getBackofficeInventoryCollectionTtlMinutes(), properties.getBackofficeInventoryCollectionMaxSize()),
                new CacheSpec(CatalogCacheNames.BACKOFFICE_CUSTOMERS_COLLECTION, properties.getBackofficeCustomersCollectionTtlMinutes(), properties.getBackofficeCustomersCollectionMaxSize()),
                new CacheSpec(CatalogCacheNames.BACKOFFICE_LOYALTY_OVERVIEW, properties.getBackofficeLoyaltyOverviewTtlMinutes(), properties.getBackofficeLoyaltyOverviewMaxSize()),
                new CacheSpec(CatalogCacheNames.BACKOFFICE_LOYALTY_TIERS, properties.getBackofficeLoyaltyTiersTtlMinutes(), properties.getBackofficeLoyaltyTiersMaxSize()),
                new CacheSpec(CatalogCacheNames.BACKOFFICE_LOYALTY_TOP_CUSTOMERS, properties.getBackofficeLoyaltyTopCustomersTtlMinutes(), properties.getBackofficeLoyaltyTopCustomersMaxSize())
        );
    }

    record CacheSpec(String name, long ttlMinutes, long maxSize) {
    }
}
