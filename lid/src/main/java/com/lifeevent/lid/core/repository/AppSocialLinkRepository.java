package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.AppSocialLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AppSocialLinkRepository extends JpaRepository<AppSocialLink, String> {

    @Query("""
            select l from AppSocialLink l
            where l.appConfig.id = :appConfigId
            order by coalesce(l.sortOrder, 0) asc, l.createdAt asc
            """)
    List<AppSocialLink> findByAppConfigId(@Param("appConfigId") String appConfigId);
}

