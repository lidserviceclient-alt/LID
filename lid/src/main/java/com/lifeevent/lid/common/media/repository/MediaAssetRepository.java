package com.lifeevent.lid.common.media.repository;

import com.lifeevent.lid.common.media.entity.MediaAssetEntity;
import com.lifeevent.lid.common.media.enumeration.MediaOwnerScope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MediaAssetRepository extends JpaRepository<MediaAssetEntity, Long> {

    @Query("""
        select m
        from MediaAssetEntity m
        where (:ownerScope is null or m.ownerScope = :ownerScope)
          and (:ownerUserId is null or m.ownerUserId = :ownerUserId)
          and (:folder is null or m.folder = :folder)
          and (
              :query is null
              or lower(m.originalFilename) like concat('%', :query, '%')
              or lower(m.objectKey) like concat('%', :query, '%')
          )
        order by m.createdAt desc, m.id desc
    """)
    Page<MediaAssetEntity> search(
            @Param("ownerScope") MediaOwnerScope ownerScope,
            @Param("ownerUserId") String ownerUserId,
            @Param("folder") String folder,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("""
        select m
        from MediaAssetEntity m
        where m.ownerScope = :ownerScope
          and m.ownerUserId = :ownerUserId
          and lower(m.originalFilename) = lower(:originalFilename)
        order by m.id asc
    """)
    Optional<MediaAssetEntity> findByOwnerAndOriginalFilenameIgnoreCase(
            @Param("ownerScope") MediaOwnerScope ownerScope,
            @Param("ownerUserId") String ownerUserId,
            @Param("originalFilename") String originalFilename
    );

    @Modifying
    long deleteByObjectKey(String objectKey);
}
