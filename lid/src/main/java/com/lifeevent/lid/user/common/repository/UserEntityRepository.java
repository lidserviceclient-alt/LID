package com.lifeevent.lid.user.common.repository;

import com.lifeevent.lid.user.common.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserEntityRepository extends JpaRepository<UserEntity, String> {
    
    /**
     * Recherche par email - sans jointure aux sous-classes
     * Retourne TOUTES les UserEntity (parents ET enfants via SINGLE_TABLE)
     */
    @Query("SELECT u FROM UserEntity u WHERE u.email = :email")
    Optional<UserEntity> findByEmail(@Param("email") String email);
    
    /**
     * Vérifier si un email existe - requête optimisée sans jointure
     */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM UserEntity u WHERE u.email = :email")
    boolean existsByEmail(@Param("email") String email);
    
    /**
     * Récupérer tous les utilisateurs sans jointures
     */
    @Query("SELECT u FROM UserEntity u")
    List<UserEntity> findAll();
}
