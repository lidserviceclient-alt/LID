package com.lifeevent.lid.discount.repository;

import com.lifeevent.lid.discount.entity.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long> {
    interface DailyUsageView {
        LocalDate getDay();
        Long getUsage();
    }

    Optional<Discount> findByCodeIgnoreCase(String code);

    @Query("""
        SELECT COALESCE(SUM(COALESCE(d.usageCount, 0)), 0)
        FROM Discount d
    """)
    long sumUsageCount();

    @Query("""
        SELECT COALESCE(SUM(COALESCE(d.usageCount, 0) * COALESCE(d.value, 0)), 0)
        FROM Discount d
    """)
    double sumUsageReduction();

    @Query("""
        SELECT d.createdAt,
               COALESCE(d.usageCount, 0)
        FROM Discount d
        WHERE d.createdAt >= :from
    """)
    List<Object[]> findUsageWithCreatedAtFrom(@Param("from") LocalDateTime from);

    @Query("""
        SELECT CAST(d.createdAt as date) AS day,
               COALESCE(SUM(COALESCE(d.usageCount, 0)), 0) AS usage
        FROM Discount d
        WHERE d.createdAt >= :from
        GROUP BY CAST(d.createdAt as date)
    """)
    List<DailyUsageView> aggregateUsageByDayFrom(@Param("from") LocalDateTime from);
}
