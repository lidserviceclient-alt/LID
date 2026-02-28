package com.lifeevent.lid.backoffice.setting.repository;

import com.lifeevent.lid.backoffice.setting.entity.BackOfficeSocialLinkEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BackOfficeSocialLinkRepository extends JpaRepository<BackOfficeSocialLinkEntity, String> {
    List<BackOfficeSocialLinkEntity> findAllByOrderBySortOrderAscCreatedAtAsc();
}
