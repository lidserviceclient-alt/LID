package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.enums.RoleUtilisateur;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, String> {
    Optional<Utilisateur> findByEmail(String email);
    Page<Utilisateur> findByRole(RoleUtilisateur role, Pageable pageable);
    long countByRole(RoleUtilisateur role);

    @Query("""
            select u from Utilisateur u
            where (
              (:role is null and u.role <> com.lifeevent.lid.core.enums.RoleUtilisateur.SUPPRIME)
              or (:role is not null and u.role = :role)
            )
              and (
                :q is null
                or lower(u.email) like concat('%', lower(:q), '%')
                or lower(coalesce(u.nom, '')) like concat('%', lower(:q), '%')
                or lower(coalesce(u.prenom, '')) like concat('%', lower(:q), '%')
              )
            """)
    Page<Utilisateur> search(@Param("role") RoleUtilisateur role, @Param("q") String q, Pageable pageable);
}
