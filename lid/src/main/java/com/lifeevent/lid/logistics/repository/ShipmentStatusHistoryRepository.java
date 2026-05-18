package com.lifeevent.lid.logistics.repository;

import com.lifeevent.lid.logistics.entity.ShipmentStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ShipmentStatusHistoryRepository extends JpaRepository<ShipmentStatusHistory, Long> {

    List<ShipmentStatusHistory> findByShipmentIdInOrderByChangedAtAsc(Collection<Long> shipmentIds);
}
