package com.lifeevent.lid.order.repository;

import com.lifeevent.lid.order.entity.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
}

