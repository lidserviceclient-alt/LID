package com.lifeevent.lid.common.cache;

import java.util.Set;

public interface CacheScopeVersionService {

    long catalogVersion();

    void bumpCatalog();

    long productGlobalVersion();

    void bumpProductGlobal();

    long blogVersion();

    void bumpBlog();

    long ticketVersion();

    void bumpTicket();

    long partnerVersion(String partnerId);

    String partnerVersionToken(String partnerId);

    void bumpPartner(String partnerId);

    void bumpPartners(Set<String> partnerIds);

    void bumpAllPartners();

    long reviewVersion(Long productId);

    String reviewVersionToken(Long productId);

    void bumpReview(Set<Long> productIds);

    long marketingVersion();

    void bumpMarketing();

    long loyaltyVersion();

    void bumpLoyalty();
}
