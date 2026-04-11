package com.lifeevent.lid.user.deliverydriver.repository;

import com.lifeevent.lid.user.deliverydriver.entity.DelivryDriverProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface DelivryDriverProfileRepository extends JpaRepository<DelivryDriverProfileEntity, String> {

    List<DelivryDriverProfileEntity> findByUserIdIn(Collection<String> userIds);

    Optional<DelivryDriverProfileEntity> findByPhoneNumber(String phoneNumber);
}
