package com.lifeevent.lid.auth.repository;

import com.lifeevent.lid.auth.entity.Authentication;
import com.lifeevent.lid.auth.constant.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthenticationRepository extends JpaRepository<Authentication, String> {
    Optional<Authentication> findByUserId(String userId);

    @Query("""
            select distinct a.userId
            from Authentication a
            join a.roles role
            where role in :roles
            """)
    List<String> findUserIdsByRolesIn(@Param("roles") List<UserRole> roles);

    @Query(
            value = """
                    SELECT DISTINCT ar.authentication_user_id
                    FROM authentication_roles ar
                    JOIN user_entity u ON u.user_id = ar.authentication_user_id
                    WHERE ar.roles IN (:roles)
                      AND (
                        :q IS NULL OR :q = '' OR
                        LOWER(CAST(u.user_id AS text)) LIKE LOWER(CONCAT('%', :q, '%')) OR
                        LOWER(CAST(u.email AS text)) LIKE LOWER(CONCAT('%', :q, '%')) OR
                        LOWER(CAST(u.first_name AS text)) LIKE LOWER(CONCAT('%', :q, '%')) OR
                        LOWER(CAST(u.last_name AS text)) LIKE LOWER(CONCAT('%', :q, '%'))
                      )
                    """,
            countQuery = """
                    SELECT COUNT(DISTINCT ar.authentication_user_id)
                    FROM authentication_roles ar
                    JOIN user_entity u ON u.user_id = ar.authentication_user_id
                    WHERE ar.roles IN (:roles)
                      AND (
                        :q IS NULL OR :q = '' OR
                        LOWER(CAST(u.user_id AS text)) LIKE LOWER(CONCAT('%', :q, '%')) OR
                        LOWER(CAST(u.email AS text)) LIKE LOWER(CONCAT('%', :q, '%')) OR
                        LOWER(CAST(u.first_name AS text)) LIKE LOWER(CONCAT('%', :q, '%')) OR
                        LOWER(CAST(u.last_name AS text)) LIKE LOWER(CONCAT('%', :q, '%'))
                      )
                    """,
            nativeQuery = true
    )
    Page<String> searchUserIdsByRolesIn(@Param("roles") List<String> roles, @Param("q") String q, Pageable pageable);
}
