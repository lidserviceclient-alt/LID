package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.CodePromo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CodePromoRepository extends JpaRepository<CodePromo, String> {
    Optional<CodePromo> findByCodeIgnoreCase(String code);
}

