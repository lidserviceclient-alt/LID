package com.lifeevent.lid.backoffice.lid.setting.repository;

import com.lifeevent.lid.backoffice.lid.setting.entity.SecurityActivityEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface SecurityActivityRepository extends JpaRepository<SecurityActivityEntity, Long> {
    Page<SecurityActivityEntity> findAllByOrderByEventAtDesc(Pageable pageable);
    Page<SecurityActivityEntity> findByEventAtAfterOrderByEventAtDesc(LocalDateTime since, Pageable pageable);
    long countByEventAtAfter(LocalDateTime since);
}
