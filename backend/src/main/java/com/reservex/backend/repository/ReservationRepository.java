package com.reservex.backend.repository;

import com.reservex.backend.entity.Reservation;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
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
}
