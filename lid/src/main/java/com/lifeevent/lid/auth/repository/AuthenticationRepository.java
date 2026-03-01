package com.lifeevent.lid.auth.repository;

import com.lifeevent.lid.auth.entity.Authentication;
import com.lifeevent.lid.auth.constant.UserRole;
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
}
