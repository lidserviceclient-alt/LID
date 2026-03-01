package com.lifeevent.lid.loyalty.repository;

import com.lifeevent.lid.loyalty.entity.LoyaltyPointAdjustment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoyaltyPointAdjustmentRepository extends JpaRepository<LoyaltyPointAdjustment, Long> {

    Page<LoyaltyPointAdjustment> findByCustomer_UserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    List<LoyaltyPointAdjustment> findByCustomer_UserIdOrderByCreatedAtDesc(String userId);

    @Query("SELECT COALESCE(SUM(a.deltaPoints), 0) FROM LoyaltyPointAdjustment a WHERE a.customer.userId = :userId")
    long sumDeltaByCustomerId(@Param("userId") String userId);

    @Query("SELECT COALESCE(SUM(a.deltaPoints), 0) FROM LoyaltyPointAdjustment a")
    long sumAllDeltas();
}
