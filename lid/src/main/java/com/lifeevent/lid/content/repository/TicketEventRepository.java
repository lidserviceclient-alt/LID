package com.lifeevent.lid.content.repository;

import com.lifeevent.lid.content.entity.TicketEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketEventRepository extends JpaRepository<TicketEvent, String> {
}
