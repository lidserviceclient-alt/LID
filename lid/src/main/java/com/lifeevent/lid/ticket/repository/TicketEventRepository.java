package com.lifeevent.lid.ticket.repository;

import com.lifeevent.lid.ticket.entity.TicketEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketEventRepository extends JpaRepository<TicketEvent, Long> {
}
