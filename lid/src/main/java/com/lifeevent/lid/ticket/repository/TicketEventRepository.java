package com.lifeevent.lid.ticket.repository;

import com.lifeevent.lid.ticket.entity.TicketEvent;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TicketEventRepository extends JpaRepository<TicketEvent, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TicketEvent t WHERE t.id = :id")
    Optional<TicketEvent> findByIdForUpdate(@Param("id") Long id);

    @Modifying
    @Query("""
        UPDATE TicketEvent t
        SET t.quantityAvailable = t.quantityAvailable - :quantity,
            t.quantityReserved = t.quantityReserved + :quantity
        WHERE t.id = :ticketEventId
          AND t.quantityAvailable >= :quantity
        """)
    int reserveIfEnough(@Param("ticketEventId") Long ticketEventId, @Param("quantity") int quantity);

    @Modifying
    @Query("""
        UPDATE TicketEvent t
        SET t.quantityAvailable = t.quantityAvailable + :quantity,
            t.quantityReserved = t.quantityReserved - :quantity
        WHERE t.id = :ticketEventId
          AND t.quantityReserved >= :quantity
        """)
    int releaseReserved(@Param("ticketEventId") Long ticketEventId, @Param("quantity") int quantity);

    @Modifying
    @Query("""
        UPDATE TicketEvent t
        SET t.quantityReserved = t.quantityReserved - :quantity
        WHERE t.id = :ticketEventId
          AND t.quantityReserved >= :quantity
        """)
    int consumeReserved(@Param("ticketEventId") Long ticketEventId, @Param("quantity") int quantity);
}
