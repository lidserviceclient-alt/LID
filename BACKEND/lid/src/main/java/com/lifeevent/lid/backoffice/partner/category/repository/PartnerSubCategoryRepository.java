package com.lifeevent.lid.backoffice.partner.category.repository;

import com.lifeevent.lid.backoffice.partner.category.entity.PartnerSubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartnerSubCategoryRepository extends JpaRepository<PartnerSubCategory, Long> {

    List<PartnerSubCategory> findByPartnerIdOrderByCreatedAtDesc(String partnerId);

    Optional<PartnerSubCategory> findByIdAndPartnerId(Long id, String partnerId);
}

