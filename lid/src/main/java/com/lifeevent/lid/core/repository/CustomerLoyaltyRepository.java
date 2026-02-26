package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.CustomerLoyalty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerLoyaltyRepository extends JpaRepository<CustomerLoyalty, String> {
    Optional<CustomerLoyalty> findByUtilisateurId(String utilisateurId);
    List<CustomerLoyalty> findByUtilisateurIdIn(List<String> utilisateurIds);

    @Query("select coalesce(sum(c.points), 0) from CustomerLoyalty c")
    long sumAllPoints();

    @Query("""
            select count(c) from CustomerLoyalty c
            where c.points >= :min
              and (:max is null or c.points < :max)
            """)
    long countByPointsRange(@Param("min") int min, @Param("max") Integer max);

    @Query("select count(c) from CustomerLoyalty c where c.points >= :min")
    long countByPointsAtLeast(@Param("min") int min);

    @Query("""
            select c from CustomerLoyalty c
              join c.utilisateur u
            where u.role = com.lifeevent.lid.core.enums.RoleUtilisateur.CLIENT
              and (
                :q is null
                or lower(u.email) like concat('%', lower(:q), '%')
                or lower(coalesce(u.telephone, '')) like concat('%', lower(:q), '%')
                or lower(coalesce(u.nom, '')) like concat('%', lower(:q), '%')
                or lower(coalesce(u.prenom, '')) like concat('%', lower(:q), '%')
              )
            """)
    Page<CustomerLoyalty> search(@Param("q") String q, Pageable pageable);
}
