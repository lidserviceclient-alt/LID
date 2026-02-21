package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;

import java.util.Optional;
import java.util.List;

public interface CategorieRepository extends JpaRepository<Categorie, String> {
    Optional<Categorie> findBySlug(String slug);

    List<Categorie> findByIsFeaturedTrueAndEstActiveTrue(Sort sort);
}
