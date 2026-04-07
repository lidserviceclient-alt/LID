package com.lifeevent.lid.backoffice.lid.notification.repository;

import com.lifeevent.lid.backoffice.lid.notification.entity.BackOfficeNotificationEntity;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationScope;
import com.lifeevent.lid.backoffice.lid.notification.enumeration.BackOfficeNotificationTargetRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BackOfficeNotificationRepository extends JpaRepository<BackOfficeNotificationEntity, Long> {

    @Query("""
        select n
        from BackOfficeNotificationEntity n
        where n.scope = :scope
          and n.targetRole = :targetRole
          and (n.targetUserId is null or n.targetUserId = :targetUserId)
        order by n.createdAt desc, n.id desc
    """)
    Page<BackOfficeNotificationEntity> findVisibleByAudience(
            @Param("scope") BackOfficeNotificationScope scope,
            @Param("targetRole") BackOfficeNotificationTargetRole targetRole,
            @Param("targetUserId") String targetUserId,
            Pageable pageable
    );

    @Query("""
        select count(n)
        from BackOfficeNotificationEntity n
        where n.scope = :scope
          and n.targetRole = :targetRole
          and (n.targetUserId is null or n.targetUserId = :targetUserId)
          and n.readAt is null
    """)
    long countUnreadByAudience(
            @Param("scope") BackOfficeNotificationScope scope,
            @Param("targetRole") BackOfficeNotificationTargetRole targetRole,
            @Param("targetUserId") String targetUserId
    );

    @Query("""
        select n
        from BackOfficeNotificationEntity n
        where n.id = :id
          and n.scope = :scope
          and n.targetRole = :targetRole
          and (n.targetUserId is null or n.targetUserId = :targetUserId)
    """)
    Optional<BackOfficeNotificationEntity> findVisibleByIdAndAudience(
            @Param("id") Long id,
            @Param("scope") BackOfficeNotificationScope scope,
            @Param("targetRole") BackOfficeNotificationTargetRole targetRole,
            @Param("targetUserId") String targetUserId
    );

    @Modifying
    @Query("""
        update BackOfficeNotificationEntity n
        set n.readAt = :readAt,
            n.purgeAfter = case
                when n.purgeAfter < :purgeAfter then n.purgeAfter
                else :purgeAfter
            end
        where n.scope = :scope
          and n.targetRole = :targetRole
          and (n.targetUserId is null or n.targetUserId = :targetUserId)
          and n.readAt is null
    """)
    int markAllReadByAudience(
            @Param("scope") BackOfficeNotificationScope scope,
            @Param("targetRole") BackOfficeNotificationTargetRole targetRole,
            @Param("targetUserId") String targetUserId,
            @Param("readAt") LocalDateTime readAt,
            @Param("purgeAfter") LocalDateTime purgeAfter
    );

    Optional<BackOfficeNotificationEntity> findTopByDedupeKeyAndPurgeAfterAfterOrderByCreatedAtDesc(String dedupeKey, LocalDateTime now);

    @Query("""
        select n.id
        from BackOfficeNotificationEntity n
        where n.purgeAfter <= :cutoff
        order by n.purgeAfter asc, n.id asc
    """)
    List<Long> findIdsToPurge(@Param("cutoff") LocalDateTime cutoff, Pageable pageable);
}
