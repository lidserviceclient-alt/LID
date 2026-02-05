package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.Produit;
import com.lifeevent.lid.core.entity.ProduitImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProduitImageRepository extends JpaRepository<ProduitImage, String> {
    List<ProduitImage> findByProduit(Produit produit);
}
