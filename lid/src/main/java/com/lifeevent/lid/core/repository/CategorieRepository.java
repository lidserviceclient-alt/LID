package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategorieRepository extends JpaRepository<Categorie, String> {
    Optional<Categorie> findBySlug(String slug);
}
