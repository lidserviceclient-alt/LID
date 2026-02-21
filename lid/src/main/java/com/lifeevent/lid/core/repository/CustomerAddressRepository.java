package com.lifeevent.lid.core.repository;

import com.lifeevent.lid.core.entity.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, String> {
    List<CustomerAddress> findByUtilisateur_Id(String utilisateurId);
    Optional<CustomerAddress> findByUtilisateur_IdAndId(String utilisateurId, String id);
    boolean existsByUtilisateur_IdAndIsDefaultTrue(String utilisateurId);
}
