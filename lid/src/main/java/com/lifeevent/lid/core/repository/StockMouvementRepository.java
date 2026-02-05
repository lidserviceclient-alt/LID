package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.StockMouvement;
import com.lifeevent.lid.core.enums.TypeMouvementStock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMouvementRepository extends JpaRepository<StockMouvement, String> {
    Page<StockMouvement> findBySkuContainingIgnoreCase(String sku, Pageable pageable);

    Page<StockMouvement> findByType(TypeMouvementStock type, Pageable pageable);

    Page<StockMouvement> findBySkuContainingIgnoreCaseAndType(String sku, TypeMouvementStock type, Pageable pageable);
}

