package org.example.petcarebe.repository;

import org.example.petcarebe.model.Slot;
import org.example.petcarebe.enums.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {
    
    List<Slot> findByDateAndTime(LocalDate date, LocalTime time);
    
    List<Slot> findByDateAndTimeAndStatus(LocalDate date, LocalTime time, SlotStatus status);
    
    @Query("SELECT s FROM Slot s WHERE s.date = :date AND s.time = :time ORDER BY s.slotIndex DESC")
    List<Slot> findSlotsForDateAndTimeOrderByIndexDesc(@Param("date") LocalDate date, @Param("time") LocalTime time);
    
    @Query("SELECT COUNT(s) FROM Slot s WHERE s.date = :date AND s.time = :time AND s.status = :status")
    long countByDateAndTimeAndStatus(@Param("date") LocalDate date, @Param("time") LocalTime time, @Param("status") SlotStatus status);
    
    @Query("SELECT s FROM Slot s WHERE s.date = :date AND s.time = :time AND s.status = :status ORDER BY s.slotIndex DESC")
    List<Slot> findAvailableSlotsForDateAndTime(
        @Param("date") LocalDate date,
        @Param("time") LocalTime time,
        @Param("status") SlotStatus status
    );
} 