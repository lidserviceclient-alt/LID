package com.lifeevent.lid.backoffice.lid.setting.repository;

import com.lifeevent.lid.backoffice.lid.setting.entity.SecurityActivityEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SecurityActivityRepository extends JpaRepository<SecurityActivityEntity, Long> {
    Page<SecurityActivityEntity> findAllByOrderByEventAtDesc(Pageable pageable);
    Page<SecurityActivityEntity> findByEventAtAfterOrderByEventAtDesc(LocalDateTime since, Pageable pageable);
    long countByEventAtAfter(LocalDateTime since);

    @Query("""
        select s.id
        from SecurityActivityEntity s
        where s.eventAt < :cutoff
        order by s.eventAt asc, s.id asc
    """)
    List<Long> findIdsByEventAtBeforeOrderByEventAtAsc(@Param("cutoff") LocalDateTime cutoff, Pageable pageable);
}
