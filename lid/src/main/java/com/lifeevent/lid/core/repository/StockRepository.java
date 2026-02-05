package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.Produit;
import com.lifeevent.lid.core.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository("coreStockRepository")
public interface StockRepository extends JpaRepository<Stock, String> {
    Optional<Stock> findByProduit(Produit produit);
    long countByQuantiteDisponibleLessThan(Integer threshold);
    List<Stock> findTop5ByQuantiteDisponibleLessThanOrderByQuantiteDisponibleAsc(Integer threshold);
}
