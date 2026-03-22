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

    @Query("""
            SELECT DISTINCT a.userId
            FROM Authentication a
            JOIN a.roles role
            JOIN UserEntity u ON u.userId = a.userId
            WHERE CAST(role AS string) IN :roles
              AND (
                :q IS NULL OR :q = '' OR
                LOWER(CAST(u.userId AS string)) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(CAST(u.email AS string)) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(CAST(u.firstName AS string)) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(CAST(u.lastName AS string)) LIKE LOWER(CONCAT('%', :q, '%'))
              )
            """)
    Page<String> searchUserIdsByRolesIn(@Param("roles") List<String> roles, @Param("q") String q, Pageable pageable);
}
