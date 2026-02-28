package com.lifeevent.lid.backoffice.setting.repository;

import com.lifeevent.lid.backoffice.setting.entity.BackOfficeSecurityActivityEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BackOfficeSecurityActivityRepository extends JpaRepository<BackOfficeSecurityActivityEntity, Long> {
    Page<BackOfficeSecurityActivityEntity> findAllByOrderByEventAtDesc(Pageable pageable);
}
