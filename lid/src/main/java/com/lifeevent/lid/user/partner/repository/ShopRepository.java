package com.lifeevent.lid.user.partner.repository;

import com.lifeevent.lid.user.partner.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository pour l'entité Shop
 */
@Repository
public interface ShopRepository extends JpaRepository<Shop, Long> {
}
