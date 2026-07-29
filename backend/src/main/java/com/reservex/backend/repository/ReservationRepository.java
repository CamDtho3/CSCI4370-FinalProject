package com.reservex.backend.repository;

import com.reservex.backend.entity.Reservation;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Integer> {

    /** Covers already booked into a slot — the capacity check and availableSpots share this. */
    @Query("SELECT COALESCE(SUM(r.partySize), 0) FROM Reservation r "
            + "WHERE r.restaurant.restPhone = :restPhone AND r.slotDate = :slotDate "
            + "AND r.slotTime = :slotTime AND r.resStatus NOT IN :excludedStatuses")
    int sumPartySizeForSlot(
            @Param("restPhone") String restPhone,
            @Param("slotDate") LocalDate slotDate,
            @Param("slotTime") LocalTime slotTime,
            @Param("excludedStatuses") Collection<String> excludedStatuses);

    List<Reservation> findByRestaurant_RestPhoneAndSlotDateOrderBySlotTimeAsc(
            String restPhone, LocalDate slotDate);

    List<Reservation> findByUser_EmailOrderBySlotDateDescSlotTimeDesc(String email);

    /** Same as sumPartySizeForSlot, but excludes one reservation's own party —
     *  used when editing, since its current seats are about to be released. */
    @Query("SELECT COALESCE(SUM(r.partySize), 0) FROM Reservation r "
            + "WHERE r.restaurant.restPhone = :restPhone AND r.slotDate = :slotDate "
            + "AND r.slotTime = :slotTime AND r.resStatus NOT IN :excludedStatuses "
            + "AND r.resNum <> :excludeResNum")
    int sumPartySizeForSlotExcluding(
            @Param("restPhone") String restPhone,
            @Param("slotDate") LocalDate slotDate,
            @Param("slotTime") LocalTime slotTime,
            @Param("excludedStatuses") Collection<String> excludedStatuses,
            @Param("excludeResNum") Integer excludeResNum);
}
