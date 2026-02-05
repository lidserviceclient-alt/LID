package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.CommentaireProduit;
import com.lifeevent.lid.core.entity.Produit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentaireProduitRepository extends JpaRepository<CommentaireProduit, String> {
    List<CommentaireProduit> findByProduit(Produit produit);
}
