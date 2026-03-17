package com.lifeevent.lid.user.partner.repository;

import com.lifeevent.lid.user.partner.entity.Shop;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour l'entité Shop
 */
@Repository
public interface ShopRepository extends JpaRepository<Shop, Long> {

    @EntityGraph(attributePaths = {"mainCategory", "partner"})
    List<Shop> findAllByOrderByCreatedAtDesc();
}
